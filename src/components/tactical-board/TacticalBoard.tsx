"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { assignPlayersToFormation } from "@/components/tactical-board/autoFormation";
import type { TacticPlayer } from "@/components/tactics/types";

const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 760;
const STORAGE_KEY = "11connect:tactical-board:v1";
const PLANS_KEY = "11connect:tactical-plans:v1";
const HISTORY_LIMIT = 60;

type Point = { x: number; y: number };
type Tool =
  | "select"
  | "player"
  | "opponent"
  | "goalkeeper"
  | "ball"
  | "arrow"
  | "run"
  | "line"
  | "freehand"
  | "eraser";
type MarkerKind = "player" | "opponent" | "goalkeeper" | "ball";
type StrokeKind = "arrow" | "run" | "line" | "freehand";
type PitchTheme = "classic" | "bright" | "night";
type JerseyDesign = "solid" | "stripes" | "centerStripe" | "halves" | "sash";
type BoardFormation = "4-2-3-1" | "4-3-3" | "4-4-2" | "3-5-2";

type MarkerObject = {
  id: string;
  type: "marker";
  kind: MarkerKind;
  x: number;
  y: number;
  color: string;
  number: string;
  name: string;
};

type StrokeObject = {
  id: string;
  type: "stroke";
  kind: StrokeKind;
  color: string;
  width: number;
  points: Point[];
};

type BoardObject = MarkerObject | StrokeObject;

type StoredBoard = {
  objects: BoardObject[];
  theme: PitchTheme;
  jerseyDesign?: JerseyDesign;
};

type SavedPlan = StoredBoard & {
  id: string;
  name: string;
  updatedAt: string;
};

type Gesture = {
  id: string;
  before: BoardObject[];
  offsetX: number;
  offsetY: number;
  moved: boolean;
};

const tools: Array<{
  id: Tool;
  icon: string;
  label: string;
  group: "objects" | "drawing" | "edit";
}> = [
  { id: "select", icon: "↖", label: "Auswählen", group: "edit" },
  { id: "player", icon: "●", label: "Kaderspieler", group: "objects" },
  { id: "opponent", icon: "●", label: "Gegner", group: "objects" },
  { id: "goalkeeper", icon: "▣", label: "Torwart", group: "objects" },
  { id: "ball", icon: "⚽", label: "Ball", group: "objects" },
  { id: "arrow", icon: "➜", label: "Aktionspfeil", group: "drawing" },
  { id: "run", icon: "⌁", label: "Laufweg", group: "drawing" },
  { id: "line", icon: "╱", label: "Linie", group: "drawing" },
  { id: "freehand", icon: "✎", label: "Freihand", group: "drawing" },
  { id: "eraser", icon: "⌫", label: "Objekt löschen", group: "edit" },
];

const colors = [
  "#38bdf8",
  "#ef4444",
  "#facc15",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#ffffff",
  "#111827",
];

const pitchThemes: Array<{ id: PitchTheme; label: string }> = [
  { id: "classic", label: "Klassisch" },
  { id: "bright", label: "Hell" },
  { id: "night", label: "Flutlicht" },
];

const jerseyDesigns: Array<{ id: JerseyDesign; label: string }> = [
  { id: "solid", label: "Einfarbig" },
  { id: "stripes", label: "Längsstreifen" },
  { id: "centerStripe", label: "Mittelstreifen" },
  { id: "halves", label: "Zweifarbig" },
  { id: "sash", label: "Diagonalstreifen" },
];

const boardFormations: Record<
  BoardFormation,
  Array<Point & { position: string }>
> = {
  "4-2-3-1": [
    { position: "TW", x: 100, y: 380 },
    { position: "LV", x: 270, y: 125 },
    { position: "LIV", x: 250, y: 300 },
    { position: "RIV", x: 250, y: 460 },
    { position: "RV", x: 270, y: 635 },
    { position: "LDM", x: 450, y: 290 },
    { position: "RDM", x: 450, y: 470 },
    { position: "LM", x: 670, y: 150 },
    { position: "ZOM", x: 690, y: 380 },
    { position: "RM", x: 670, y: 610 },
    { position: "ST", x: 930, y: 380 },
  ],
  "4-3-3": [
    { position: "TW", x: 100, y: 380 },
    { position: "LV", x: 270, y: 125 },
    { position: "LIV", x: 250, y: 300 },
    { position: "RIV", x: 250, y: 460 },
    { position: "RV", x: 270, y: 635 },
    { position: "LZM", x: 500, y: 220 },
    { position: "ZDM", x: 450, y: 380 },
    { position: "RZM", x: 500, y: 540 },
    { position: "LS", x: 810, y: 155 },
    { position: "ST", x: 930, y: 380 },
    { position: "RS", x: 810, y: 605 },
  ],
  "4-4-2": [
    { position: "TW", x: 100, y: 380 },
    { position: "LV", x: 270, y: 125 },
    { position: "LIV", x: 250, y: 300 },
    { position: "RIV", x: 250, y: 460 },
    { position: "RV", x: 270, y: 635 },
    { position: "LM", x: 530, y: 145 },
    { position: "LZM", x: 500, y: 310 },
    { position: "RZM", x: 500, y: 450 },
    { position: "RM", x: 530, y: 615 },
    { position: "LS", x: 840, y: 290 },
    { position: "RS", x: 840, y: 470 },
  ],
  "3-5-2": [
    { position: "TW", x: 100, y: 380 },
    { position: "LIV", x: 260, y: 210 },
    { position: "IV", x: 230, y: 380 },
    { position: "RIV", x: 260, y: 550 },
    { position: "LM", x: 510, y: 115 },
    { position: "LDM", x: 460, y: 285 },
    { position: "ZOM", x: 590, y: 380 },
    { position: "RDM", x: 460, y: 475 },
    { position: "RM", x: 510, y: 645 },
    { position: "LS", x: 850, y: 285 },
    { position: "RS", x: 850, y: 475 },
  ],
};

export function TacticalBoard({ players }: { players: TacticPlayer[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const drawingBaseRef = useRef<BoardObject[]>([]);
  const undoRef = useRef<BoardObject[][]>([]);
  const redoRef = useRef<BoardObject[][]>([]);

  const [objects, setObjects] = useState<BoardObject[]>([]);
  const [draft, setDraft] = useState<StrokeObject | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [pitchTheme, setPitchTheme] = useState<PitchTheme>("classic");
  const [jerseyDesign, setJerseyDesign] = useState<JerseyDesign>("solid");
  const [boardFormation, setBoardFormation] = useState<BoardFormation>("4-2-3-1");
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id ?? "");
  const [markerName, setMarkerName] = useState("");
  const [markerNumber, setMarkerNumber] = useState("1");
  const [planName, setPlanName] = useState("Neue Taktik");
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [, setHistoryVersion] = useState(0);
  const [status, setStatus] = useState("Bereit");

  const selectedObject = useMemo(
    () => objects.find((object) => object.id === selectedId) ?? null,
    [objects, selectedId]
  );
  const selectedMarker = selectedObject?.type === "marker" ? selectedObject : null;
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? null;
  const selectedTool = tools.find((entry) => entry.id === tool) ?? tools[0];

  useEffect(() => {
    try {
      const storedBoard = window.localStorage.getItem(STORAGE_KEY);
      const storedPlans = window.localStorage.getItem(PLANS_KEY);

      if (storedBoard) {
        const parsed = JSON.parse(storedBoard) as StoredBoard;
        if (Array.isArray(parsed.objects)) {
          setObjects(parsed.objects);
        }
        if (pitchThemes.some((theme) => theme.id === parsed.theme)) {
          setPitchTheme(parsed.theme);
        }
        const storedJerseyDesign = parsed.jerseyDesign;
        if (
          storedJerseyDesign &&
          jerseyDesigns.some((design) => design.id === storedJerseyDesign)
        ) {
          setJerseyDesign(storedJerseyDesign);
        }
      }

      if (storedPlans) {
        const parsed = JSON.parse(storedPlans) as SavedPlan[];
        if (Array.isArray(parsed)) {
          setPlans(parsed);
        }
      }
    } catch {
      setStatus("Gespeicherte Taktik konnte nicht geladen werden");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ objects, theme: pitchTheme, jerseyDesign } satisfies StoredBoard)
    );
  }, [isHydrated, jerseyDesign, objects, pitchTheme]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  }, [isHydrated, plans]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = BOARD_WIDTH * pixelRatio;
    canvas.height = BOARD_HEIGHT * pixelRatio;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawBoard(context, objects, draft, selectedId, pitchTheme, jerseyDesign);
  }, [objects, draft, selectedId, pitchTheme, jerseyDesign]);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea")) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      } else if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        deleteSelected();
      } else if (event.key === "Escape") {
        setSelectedId(null);
        setTool("select");
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  function pushHistory(before: BoardObject[]) {
    undoRef.current = [...undoRef.current.slice(-(HISTORY_LIMIT - 1)), before];
    redoRef.current = [];
    setHistoryVersion((version) => version + 1);
  }

  function commit(nextObjects: BoardObject[], before = objects) {
    pushHistory(before);
    setObjects(nextObjects);
  }

  function undo() {
    const previous = undoRef.current.at(-1);
    if (!previous) return;
    undoRef.current = undoRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current, objects];
    setObjects(previous);
    setSelectedId(null);
    setHistoryVersion((version) => version + 1);
    setStatus("Letzte Aktion rückgängig gemacht");
  }

  function redo() {
    const next = redoRef.current.at(-1);
    if (!next) return;
    redoRef.current = redoRef.current.slice(0, -1);
    undoRef.current = [...undoRef.current, objects];
    setObjects(next);
    setSelectedId(null);
    setHistoryVersion((version) => version + 1);
    setStatus("Aktion wiederhergestellt");
  }

  function getBoardPoint(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * BOARD_WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * BOARD_HEIGHT,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getBoardPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "select") {
      const hit = hitTest(objects, point);
      setSelectedId(hit?.id ?? null);

      if (hit?.type === "marker") {
        gestureRef.current = {
          id: hit.id,
          before: objects,
          offsetX: point.x - hit.x,
          offsetY: point.y - hit.y,
          moved: false,
        };
      }
      return;
    }

    if (tool === "eraser") {
      const hit = hitTest(objects, point);
      if (hit) {
        commit(objects.filter((object) => object.id !== hit.id));
        setSelectedId(null);
        setStatus("Objekt gelöscht");
      }
      return;
    }

    if (["player", "opponent", "goalkeeper", "ball"].includes(tool)) {
      const marker = createMarker(tool as MarkerKind, point);
      commit([...objects, marker]);
      setSelectedId(marker.id);
      setTool("select");
      setStatus(tool === "ball" ? "Ball platziert" : "Spieler platziert");
      return;
    }

    const stroke = createStroke(tool as StrokeKind, point, activeColor, strokeWidth);
    drawingBaseRef.current = objects;
    setDraft(stroke);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getBoardPoint(event);
    const gesture = gestureRef.current;

    if (gesture) {
      gesture.moved = true;
      setObjects((current) =>
        current.map((object) =>
          object.id === gesture.id && object.type === "marker"
            ? {
                ...object,
                x: clamp(point.x - gesture.offsetX, 28, BOARD_WIDTH - 28),
                y: clamp(point.y - gesture.offsetY, 28, BOARD_HEIGHT - 28),
              }
            : object
        )
      );
      return;
    }

    if (!draft) return;
    setDraft((current) => {
      if (!current) return null;
      if (current.kind === "freehand") {
        return { ...current, points: [...current.points, point] };
      }
      return { ...current, points: [current.points[0], point] };
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const gesture = gestureRef.current;
    if (gesture) {
      if (gesture.moved) {
        pushHistory(gesture.before);
        setStatus("Position aktualisiert");
      }
      gestureRef.current = null;
      return;
    }

    if (draft) {
      const base = drawingBaseRef.current;
      if (draft.points.length > 1 && distance(draft.points[0], draft.points.at(-1)!) > 3) {
        commit([...base, draft], base);
        setSelectedId(draft.id);
        setStatus("Zeichnung hinzugefügt");
      }
      setDraft(null);
    }
  }

  function createMarker(kind: MarkerKind, point: Point): MarkerObject {
    if (kind === "ball") {
      return {
        id: createId(),
        type: "marker",
        kind,
        x: point.x,
        y: point.y,
        color: "#ffffff",
        number: "",
        name: "",
      };
    }

    const rosterPlayer = kind === "player" ? selectedPlayer : null;
    const defaultName = kind === "opponent" ? "Gegner" : kind === "goalkeeper" ? "Torwart" : "Spieler";

    return {
      id: createId(),
      type: "marker",
      kind,
      x: point.x,
      y: point.y,
      color: kind === "opponent" ? "#ef4444" : kind === "goalkeeper" ? "#facc15" : activeColor,
      number: String(rosterPlayer?.shirtNumber ?? (markerNumber || "1")),
      name: rosterPlayer?.eaId ?? (markerName.trim() || defaultName),
    };
  }

  function updateSelectedMarker(change: Partial<MarkerObject>) {
    if (!selectedMarker) return;
    setObjects((current) =>
      current.map((object) =>
        object.id === selectedMarker.id && object.type === "marker"
          ? { ...object, ...change }
          : object
      )
    );
  }

  function chooseColor(color: string) {
    setActiveColor(color);
    if (selectedMarker && selectedMarker.kind !== "ball") {
      updateSelectedMarker({ color });
    }
  }

  function deleteSelected() {
    if (!selectedId) return;
    commit(objects.filter((object) => object.id !== selectedId));
    setSelectedId(null);
    setStatus("Auswahl gelöscht");
  }

  function clearDrawings() {
    if (!objects.some((object) => object.type === "stroke")) return;
    commit(objects.filter((object) => object.type !== "stroke"));
    setSelectedId(null);
    setStatus("Alle Zeichnungen entfernt");
  }

  function applyFormation() {
    if (players.length === 0) {
      setStatus("Im Kader sind noch keine Spieler vorhanden");
      return;
    }

    const formationMarkers: MarkerObject[] = [];
    const formation = boardFormations[boardFormation];
    const assignedPlayers = assignPlayersToFormation(players, formation);
    for (const [slotIndex, slot] of formation.entries()) {
      const player = assignedPlayers[slotIndex];
      if (!player) continue;

      formationMarkers.push({
        id: createId(),
        type: "marker",
        kind: slot.position === "TW" ? "goalkeeper" : "player",
        x: slot.x,
        y: slot.y,
        color: slot.position === "TW" ? "#facc15" : activeColor,
        number: String(player.shirtNumber ?? ""),
        name: player.eaId,
      });
    }

    const withoutOwnTeam = objects.filter(
      (object) =>
        object.type !== "marker" ||
        (object.kind !== "player" && object.kind !== "goalkeeper")
    );
    commit([...withoutOwnTeam, ...formationMarkers]);
    setSelectedId(null);
    setTool("select");
    setStatus(`${boardFormation} mit ${formationMarkers.length} Kaderspielern aufgestellt`);
  }

  function resetBoard() {
    if (objects.length > 0 && !window.confirm("Die komplette Taktiktafel leeren?")) return;
    commit([]);
    setSelectedId(null);
    setActivePlanId("");
    setPlanName("Neue Taktik");
    setStatus("Neue, leere Taktik geöffnet");
  }

  function savePlan() {
    const cleanName = planName.trim() || "Taktik ohne Namen";
    const now = new Date().toISOString();
    let nextId = activePlanId;

    if (nextId && plans.some((plan) => plan.id === nextId)) {
      setPlans((current) =>
        current.map((plan) =>
          plan.id === nextId
            ? { ...plan, name: cleanName, objects, theme: pitchTheme, jerseyDesign, updatedAt: now }
            : plan
        )
      );
    } else {
      nextId = createId();
      setPlans((current) => [
        ...current,
        { id: nextId, name: cleanName, objects, theme: pitchTheme, jerseyDesign, updatedAt: now },
      ]);
      setActivePlanId(nextId);
    }

    setPlanName(cleanName);
    setStatus(`„${cleanName}“ gespeichert`);
  }

  function loadPlan(id: string) {
    setActivePlanId(id);
    const plan = plans.find((entry) => entry.id === id);
    if (!plan) return;
    pushHistory(objects);
    setObjects(plan.objects);
    setPitchTheme(plan.theme);
    setJerseyDesign(plan.jerseyDesign ?? "solid");
    setPlanName(plan.name);
    setSelectedId(null);
    setStatus(`„${plan.name}“ geladen`);
  }

  function deletePlan() {
    if (!activePlanId) return;
    const plan = plans.find((entry) => entry.id === activePlanId);
    if (!plan || !window.confirm(`Gespeicherte Taktik „${plan.name}“ löschen?`)) return;
    setPlans((current) => current.filter((entry) => entry.id !== activePlanId));
    setActivePlanId("");
    setPlanName("Neue Taktik");
    setStatus("Gespeicherte Taktik gelöscht");
  }

  function exportPng() {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = BOARD_WIDTH * 2;
    exportCanvas.height = BOARD_HEIGHT * 2;
    const context = exportCanvas.getContext("2d");
    if (!context) return;
    context.scale(2, 2);
    drawBoard(context, objects, null, null, pitchTheme, jerseyDesign);

    const link = document.createElement("a");
    const filename = (planName.trim() || "taktiktafel")
      .toLocaleLowerCase("de")
      .replace(/[^a-z0-9äöüß]+/gi, "-")
      .replace(/^-|-$/g, "");
    link.download = `${filename || "taktiktafel"}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
    setStatus("PNG exportiert");
  }

  async function toggleFullscreen() {
    if (!boardRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await boardRef.current.requestFullscreen();
  }

  return (
    <section className="tactical-board-shell">
      <div className="tactical-board-topbar card">
        <div className="tactical-plan-fields">
          <label>
            <span>Taktikname</span>
            <input value={planName} onChange={(event) => setPlanName(event.target.value)} />
          </label>
          <label>
            <span>Gespeicherte Taktiken</span>
            <select value={activePlanId} onChange={(event) => loadPlan(event.target.value)}>
              <option value="">– Taktik auswählen –</option>
              {plans.map((plan) => (
                <option value={plan.id} key={plan.id}>{plan.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="tactical-top-actions">
          <button className="tactical-action tactical-action--primary" type="button" onClick={savePlan}>Speichern</button>
          <button className="tactical-action" type="button" onClick={resetBoard}>Neu</button>
          <button className="tactical-action" type="button" onClick={exportPng}>PNG exportieren</button>
          <button className="tactical-action" type="button" onClick={toggleFullscreen}>Vollbild</button>
          <button className="tactical-action tactical-action--danger" type="button" onClick={deletePlan} disabled={!activePlanId}>Taktik löschen</button>
        </div>
      </div>

      <div className="tactical-board-layout">
        <aside className="tactical-toolbox card" aria-label="Werkzeuge der Taktiktafel">
          <ToolGroup title="Objekte" group="objects" activeTool={tool} onChoose={setTool} />
          <ToolGroup title="Zeichnen" group="drawing" activeTool={tool} onChoose={setTool} />
          <ToolGroup title="Bearbeiten" group="edit" activeTool={tool} onChoose={setTool} />

          <div className="tactical-tool-section">
            <div className="tactical-tool-heading">Farbe</div>
            <div className="tactical-color-grid">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`tactical-color ${activeColor === color ? "tactical-color--active" : ""}`}
                  style={{ background: color }}
                  onClick={() => chooseColor(color)}
                  aria-label={`Farbe ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="tactical-tool-section">
            <div className="tactical-tool-heading">Linienstärke</div>
            <div className="tactical-width-grid">
              {[2, 4, 7].map((width) => (
                <button
                  type="button"
                  key={width}
                  className={strokeWidth === width ? "active" : ""}
                  onClick={() => setStrokeWidth(width)}
                  aria-label={`Linienstärke ${width}`}
                >
                  <span style={{ height: width }} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="tactical-canvas-column">
          <div className="tactical-canvas-toolbar">
            <div>
              <strong>{selectedTool.label}</strong>
              <span>{toolHint(tool)}</span>
            </div>
            <div className="tactical-history-actions">
              <button type="button" onClick={undo} disabled={undoRef.current.length === 0} aria-label="Rückgängig">↶ <span>Rückgängig</span></button>
              <button type="button" onClick={redo} disabled={redoRef.current.length === 0} aria-label="Wiederholen">↷ <span>Wiederholen</span></button>
              <button type="button" onClick={deleteSelected} disabled={!selectedId}>Auswahl löschen</button>
              <button type="button" onClick={clearDrawings}>Zeichnungen leeren</button>
            </div>
          </div>

          <div className="tactical-board-frame" ref={boardRef}>
            <canvas
              ref={canvasRef}
              className={`tactical-canvas tactical-canvas--${tool}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              aria-label="Interaktive Taktiktafel"
            />
          </div>

          <div className="tactical-status" role="status">
            <span className="tactical-status-dot" />
            {status}
            <span className="tactical-status-help">Tipp: Strg+Z macht Aktionen rückgängig · Entf löscht die Auswahl</span>
          </div>
        </div>

        <aside className="tactical-properties card">
          <div>
            <div className="kpi-label">Einstellungen</div>
            <h3>Objekt & Spielfeld</h3>
          </div>

          <label>
            <span>Kaderspieler</span>
            <select
              value={selectedPlayerId}
              onChange={(event) => {
                const id = event.target.value;
                setSelectedPlayerId(id);
                const player = players.find((entry) => entry.id === id);
                if (player) {
                  setMarkerName(player.eaId);
                  setMarkerNumber(String(player.shirtNumber ?? ""));
                }
              }}
            >
              <option value="">Freier Spieler</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.shirtNumber ? `#${player.shirtNumber} · ` : ""}{player.eaId}
                </option>
              ))}
            </select>
          </label>

          <div className="tactical-form-row">
            <label>
              <span>Nummer</span>
              <input
                value={selectedMarker?.number ?? markerNumber}
                maxLength={3}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                  if (selectedMarker) updateSelectedMarker({ number: value });
                  else setMarkerNumber(value);
                }}
              />
            </label>
            <label>
              <span>Name</span>
              <input
                value={selectedMarker?.name ?? markerName}
                maxLength={24}
                onChange={(event) => {
                  if (selectedMarker) updateSelectedMarker({ name: event.target.value });
                  else setMarkerName(event.target.value);
                }}
              />
            </label>
          </div>

          <button
            type="button"
            className="tactical-add-player"
            onClick={() => setTool("player")}
          >
            Kaderspieler auf Feld setzen
          </button>

          <div className="tactical-formation-control">
            <label>
              <span>Kaderformation</span>
              <select
                value={boardFormation}
                onChange={(event) => setBoardFormation(event.target.value as BoardFormation)}
              >
                {Object.keys(boardFormations).map((formation) => (
                  <option key={formation} value={formation}>{formation}</option>
                ))}
              </select>
            </label>
            <button type="button" className="tactical-action" onClick={applyFormation}>
              Automatisch aufstellen
            </button>
          </div>

          <label>
            <span>Kader-Trikotdesign</span>
            <select
              value={jerseyDesign}
              onChange={(event) => {
                const design = event.target.value as JerseyDesign;
                setJerseyDesign(design);
                const label = jerseyDesigns.find((entry) => entry.id === design)?.label;
                setStatus(`Trikotdesign „${label ?? design}“ ausgewählt`);
              }}
            >
              {jerseyDesigns.map((design) => (
                <option key={design.id} value={design.id}>{design.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Spielfeld-Stil</span>
            <select value={pitchTheme} onChange={(event) => setPitchTheme(event.target.value as PitchTheme)}>
              {pitchThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
          </label>

          <div className="tactical-selection-info">
            <strong>{selectedObject ? "Objekt ausgewählt" : "Keine Auswahl"}</strong>
            <span>
              {selectedObject
                ? selectedObject.type === "marker"
                  ? "Verschieben, beschriften, umfärben oder löschen."
                  : "Die Zeichnung kann gelöscht oder rückgängig gemacht werden."
                : "Mit dem Auswahlwerkzeug ein Objekt anklicken."}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ToolGroup({
  title,
  group,
  activeTool,
  onChoose,
}: {
  title: string;
  group: "objects" | "drawing" | "edit";
  activeTool: Tool;
  onChoose: (tool: Tool) => void;
}) {
  return (
    <div className="tactical-tool-section">
      <div className="tactical-tool-heading">{title}</div>
      <div className="tactical-tool-grid">
        {tools.filter((tool) => tool.group === group).map((tool) => (
          <button
            type="button"
            key={tool.id}
            className={activeTool === tool.id ? "active" : ""}
            onClick={() => onChoose(tool.id)}
            aria-pressed={activeTool === tool.id}
            title={tool.label}
          >
            <span aria-hidden="true">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function createStroke(kind: StrokeKind, point: Point, color: string, width: number): StrokeObject {
  return {
    id: createId(),
    type: "stroke",
    kind,
    color,
    width,
    points: [point, point],
  };
}

function drawBoard(
  context: CanvasRenderingContext2D,
  objects: BoardObject[],
  draft: StrokeObject | null,
  selectedId: string | null,
  theme: PitchTheme,
  jerseyDesign: JerseyDesign
) {
  context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  drawPitch(context, theme);

  for (const object of objects) {
    if (object.type === "stroke") drawStroke(context, object, object.id === selectedId);
  }
  if (draft) drawStroke(context, draft, false);
  for (const object of objects) {
    if (object.type === "marker") {
      drawMarker(context, object, object.id === selectedId, jerseyDesign);
    }
  }
}

function drawPitch(context: CanvasRenderingContext2D, theme: PitchTheme) {
  const palette =
    theme === "bright"
      ? { outer: "#38633a", stripeA: "#5ca34a", stripeB: "#6eae54", line: "rgba(255,255,255,.88)" }
      : theme === "night"
        ? { outer: "#061b16", stripeA: "#0d4b36", stripeB: "#0a3f2f", line: "rgba(226,255,244,.72)" }
        : { outer: "#0b3025", stripeA: "#176b3a", stripeB: "#1d7540", line: "rgba(255,255,255,.78)" };

  context.fillStyle = palette.outer;
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  const margin = 35;
  const fieldWidth = BOARD_WIDTH - margin * 2;
  const fieldHeight = BOARD_HEIGHT - margin * 2;
  const stripeWidth = fieldWidth / 12;
  for (let index = 0; index < 12; index += 1) {
    context.fillStyle = index % 2 === 0 ? palette.stripeA : palette.stripeB;
    context.fillRect(margin + stripeWidth * index, margin, stripeWidth + 1, fieldHeight);
  }

  context.strokeStyle = palette.line;
  context.fillStyle = palette.line;
  context.lineWidth = 2.5;
  context.setLineDash([]);
  context.strokeRect(margin, margin, fieldWidth, fieldHeight);

  context.beginPath();
  context.moveTo(BOARD_WIDTH / 2, margin);
  context.lineTo(BOARD_WIDTH / 2, BOARD_HEIGHT - margin);
  context.stroke();

  context.beginPath();
  context.arc(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 102, 0, Math.PI * 2);
  context.stroke();
  drawDot(context, BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 4);

  const penaltyTop = 190;
  const penaltyHeight = 380;
  const penaltyWidth = 205;
  const goalTop = 280;
  const goalHeight = 200;
  const goalWidth = 90;
  const rightEdge = BOARD_WIDTH - margin;

  context.strokeRect(margin, penaltyTop, penaltyWidth, penaltyHeight);
  context.strokeRect(rightEdge - penaltyWidth, penaltyTop, penaltyWidth, penaltyHeight);
  context.strokeRect(margin, goalTop, goalWidth, goalHeight);
  context.strokeRect(rightEdge - goalWidth, goalTop, goalWidth, goalHeight);

  const leftSpot = 175;
  const rightSpot = BOARD_WIDTH - 175;
  drawDot(context, leftSpot, BOARD_HEIGHT / 2, 4);
  drawDot(context, rightSpot, BOARD_HEIGHT / 2, 4);

  const arcRadius = 82;
  const arcAngle = Math.acos((margin + penaltyWidth - leftSpot) / arcRadius);
  context.beginPath();
  context.arc(leftSpot, BOARD_HEIGHT / 2, arcRadius, -arcAngle, arcAngle);
  context.stroke();
  context.beginPath();
  context.arc(rightSpot, BOARD_HEIGHT / 2, arcRadius, Math.PI - arcAngle, Math.PI + arcAngle);
  context.stroke();

  context.strokeRect(17, 318, 18, 124);
  context.strokeRect(rightEdge, 318, 18, 124);
  drawNet(context, 17, 318, 18, 124, palette.line);
  drawNet(context, rightEdge, 318, 18, 124, palette.line);

  const cornerRadius = 15;
  context.beginPath();
  context.arc(margin, margin, cornerRadius, 0, Math.PI / 2);
  context.stroke();
  context.beginPath();
  context.arc(rightEdge, margin, cornerRadius, Math.PI / 2, Math.PI);
  context.stroke();
  context.beginPath();
  context.arc(margin, BOARD_HEIGHT - margin, cornerRadius, -Math.PI / 2, 0);
  context.stroke();
  context.beginPath();
  context.arc(rightEdge, BOARD_HEIGHT - margin, cornerRadius, Math.PI, Math.PI * 1.5);
  context.stroke();
}

function drawNet(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 0.7;
  for (let offset = 4; offset < width; offset += 4) {
    context.beginPath();
    context.moveTo(x + offset, y);
    context.lineTo(x + offset, y + height);
    context.stroke();
  }
  for (let offset = 6; offset < height; offset += 6) {
    context.beginPath();
    context.moveTo(x, y + offset);
    context.lineTo(x + width, y + offset);
    context.stroke();
  }
  context.restore();
}

function drawStroke(context: CanvasRenderingContext2D, stroke: StrokeObject, selected: boolean) {
  if (stroke.points.length < 2) return;
  context.save();
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = stroke.width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.setLineDash(stroke.kind === "run" ? [14, 11] : []);
  if (selected) {
    context.shadowColor = "#7dd3fc";
    context.shadowBlur = 12;
  }

  context.beginPath();
  context.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y);
  context.stroke();

  if (stroke.kind === "arrow" || stroke.kind === "run") {
    const end = stroke.points.at(-1)!;
    const previous = stroke.points.at(-2)!;
    const angle = Math.atan2(end.y - previous.y, end.x - previous.x);
    const size = 14 + stroke.width * 1.8;
    context.setLineDash([]);
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - size * Math.cos(angle - Math.PI / 6), end.y - size * Math.sin(angle - Math.PI / 6));
    context.lineTo(end.x - size * Math.cos(angle + Math.PI / 6), end.y - size * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();
  }
  context.restore();
}

function drawMarker(
  context: CanvasRenderingContext2D,
  marker: MarkerObject,
  selected: boolean,
  jerseyDesign: JerseyDesign
) {
  context.save();
  if (selected && marker.kind === "ball") {
    context.beginPath();
    context.arc(marker.x, marker.y, 26, 0, Math.PI * 2);
    context.strokeStyle = "#7dd3fc";
    context.lineWidth = 5;
    context.stroke();
  }

  if (marker.kind === "ball") {
    context.shadowColor = "rgba(0,0,0,.45)";
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(marker.x, marker.y, 19, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.strokeStyle = "#0f172a";
    context.lineWidth = 2;
    context.stroke();
    context.shadowBlur = 0;
    context.beginPath();
    context.arc(marker.x, marker.y, 6, 0, Math.PI * 2);
    context.fillStyle = "#0f172a";
    context.fill();
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2 - Math.PI / 2;
      context.beginPath();
      context.moveTo(marker.x + Math.cos(angle) * 7, marker.y + Math.sin(angle) * 7);
      context.lineTo(marker.x + Math.cos(angle) * 17, marker.y + Math.sin(angle) * 17);
      context.stroke();
    }
    context.restore();
    return;
  }

  drawJersey(
    context,
    marker,
    marker.kind === "player" ? jerseyDesign : "solid",
    selected
  );

  if (marker.name) {
    context.font = "800 13px Inter, system-ui, sans-serif";
    const label = marker.name.length > 20 ? `${marker.name.slice(0, 19)}…` : marker.name;
    const width = Math.min(context.measureText(label).width + 20, 190);
    const labelY = marker.y + 43;
    context.fillStyle = "rgba(2,6,23,.9)";
    roundedRect(context, marker.x - width / 2, labelY - 11, width, 23, 11);
    context.fill();
    context.strokeStyle = "rgba(125,211,252,.55)";
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = "#ffffff";
    context.fillText(label, marker.x, labelY + 1);
  }
  context.restore();
}

function drawJersey(
  context: CanvasRenderingContext2D,
  marker: MarkerObject,
  design: JerseyDesign,
  selected: boolean
) {
  const { x, y, color } = marker;
  const patternColor = jerseyPatternColor(color);

  context.save();
  context.shadowColor = selected ? "rgba(56,189,248,.75)" : "rgba(0,0,0,.42)";
  context.shadowBlur = selected ? 18 : 12;
  context.shadowOffsetY = selected ? 0 : 5;

  jerseyPath(context, x, y);
  context.save();
  context.clip();

  const gradient = context.createLinearGradient(x - 28, y - 28, x + 28, y + 28);
  gradient.addColorStop(0, lighten(color, 0.22));
  gradient.addColorStop(1, color);
  context.fillStyle = gradient;
  context.fillRect(x - 34, y - 32, 68, 64);

  context.fillStyle = patternColor;
  if (design === "stripes") {
    for (let offset = -24; offset <= 24; offset += 16) {
      context.fillRect(x + offset, y - 32, 8, 64);
    }
  } else if (design === "centerStripe") {
    context.fillRect(x - 8, y - 32, 16, 64);
  } else if (design === "halves") {
    context.fillRect(x, y - 32, 34, 64);
  } else if (design === "sash") {
    context.translate(x, y);
    context.rotate(-0.58);
    context.fillRect(-7, -48, 14, 96);
  }

  context.restore();
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  jerseyPath(context, x, y);
  context.strokeStyle = selected
    ? "#7dd3fc"
    : marker.kind === "goalkeeper"
      ? "#fef08a"
      : "rgba(255,255,255,.88)";
  context.lineWidth = selected ? 4 : marker.kind === "opponent" ? 3 : 2;
  context.lineJoin = "round";
  context.stroke();

  context.beginPath();
  context.arc(x, y - 23, 6, 0, Math.PI);
  context.strokeStyle = "rgba(2,6,23,.72)";
  context.lineWidth = 3;
  context.stroke();

  const number = marker.number || (marker.kind === "goalkeeper" ? "TW" : "•");
  context.font = "900 18px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const numberWidth = Math.max(24, context.measureText(number).width + 10);
  roundedRect(context, x - numberWidth / 2, y - 9, numberWidth, 23, 8);
  context.fillStyle = "rgba(2,6,23,.7)";
  context.fill();
  context.fillStyle = "#ffffff";
  context.fillText(number, x, y + 3);
  context.restore();
}

function jerseyPath(context: CanvasRenderingContext2D, x: number, y: number) {
  context.beginPath();
  context.moveTo(x - 10, y - 28);
  context.lineTo(x - 18, y - 24);
  context.lineTo(x - 32, y - 13);
  context.lineTo(x - 23, y + 2);
  context.lineTo(x - 16, y - 4);
  context.lineTo(x - 16, y + 28);
  context.lineTo(x + 16, y + 28);
  context.lineTo(x + 16, y - 4);
  context.lineTo(x + 23, y + 2);
  context.lineTo(x + 32, y - 13);
  context.lineTo(x + 18, y - 24);
  context.lineTo(x + 10, y - 28);
  context.quadraticCurveTo(x, y - 20, x - 10, y - 28);
  context.closePath();
}

function jerseyPatternColor(color: string) {
  return readableTextColor(color) === "#0f172a" ? "#172033" : lighten(color, 0.76);
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function hitTest(objects: BoardObject[], point: Point): BoardObject | null {
  for (const object of [...objects].reverse()) {
    if (object.type === "marker") {
      if (distance(point, object) <= (object.kind === "ball" ? 25 : 38)) return object;
      continue;
    }

    for (let index = 1; index < object.points.length; index += 1) {
      if (pointToSegmentDistance(point, object.points[index - 1], object.points[index]) <= 12) {
        return object;
      }
    }
  }
  return null;
}

function pointToSegmentDistance(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return distance(point, start);
  const amount = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy), 0, 1);
  return distance(point, { x: start.x + amount * dx, y: start.y + amount * dy });
}

function drawDot(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function distance(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readableTextColor(hex: string) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return red * 0.299 + green * 0.587 + blue * 0.114 > 165 ? "#0f172a" : "#ffffff";
}

function lighten(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean, 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix((value >> 16) & 255)}, ${mix((value >> 8) & 255)}, ${mix(value & 255)})`;
}

function toolHint(tool: Tool) {
  if (tool === "select") return "Objekt anklicken und Spieler verschieben";
  if (tool === "eraser") return "Zu löschendes Objekt antippen";
  if (["player", "opponent", "goalkeeper", "ball"].includes(tool)) return "Zum Platzieren auf das Feld klicken";
  if (tool === "freehand") return "Auf dem Feld zeichnen";
  return "Auf dem Feld ziehen, um Start und Ende festzulegen";
}
