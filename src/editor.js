import "./editor.css";
import {
  getWebPath,
  isLocalDevelopment,
  updateMetadata,
  updateName,
  updateStatus,
  updateWebPath,
} from "./matrix-api.js";

const statusOptions = [
  { value: "1", label: "Archive" },
  { value: "2", label: "Under Construction" },
  { value: "16", label: "Live" },
  { value: "64", label: "Safe Editing" },
];

const statusByLabel = new Map(statusOptions.map((option) => [option.label, option.value]));
const table = document.querySelector("#page-metadata-editor");
const result = document.querySelector(".editor-results");
let activeCell = null;

function setStatusPresentation(cell, label) {
  const status = label.toLowerCase().replace(/\s+/g, "-");
  cell.closest("td")?.setAttribute("data-status", status);
}

function announce(message, kind = "success") {
  result.textContent = message;
  result.dataset.kind = kind;
}

function getLabel(field) {
  return {
    status: "Status",
    name: "Page name",
    "web-path": "Web path",
    description: "Page description",
  }[field];
}

function getDisplayValue(cell) {
  return cell.dataset.displayValue ?? cell.textContent.trim();
}

function makeControl(field, value) {
  if (field === "status") {
    const select = document.createElement("select");
    select.className = "editor-control";
    select.setAttribute("aria-label", "Status");
    statusOptions.forEach((option) => {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      element.selected = option.value === statusByLabel.get(value);
      select.append(element);
    });
    return select;
  }

  const control = document.createElement(field === "description" ? "textarea" : "input");
  control.className = "editor-control";
  control.setAttribute("aria-label", getLabel(field));
  control.value = value;
  if (field === "description") {
    control.rows = 3;
  } else {
    control.type = "text";
  }
  return control;
}

function restoreCell(cell, value) {
  cell.replaceChildren(document.createTextNode(value));
  cell.dataset.displayValue = value;
  activeCell = null;
  cell.focus();
}

function validate(field, value) {
  if (field !== "description" && !value.trim()) {
    return `${getLabel(field)} cannot be empty.`;
  }

  if (field === "web-path" && (!value.startsWith("/") || value.includes("://"))) {
    return "Web path must begin with / and must not be a full URL.";
  }

  return "";
}

async function saveCell(cell, field, control, originalValue) {
  const value = control.value.trim();
  const validationError = validate(field, value);
  if (validationError) {
    announce(validationError, "error");
    control.focus();
    return;
  }

  const row = cell.closest("tr");
  const assetId = row?.dataset.assetId;
  if (!assetId) {
    announce("This row does not include a Matrix asset ID.", "error");
    return;
  }

  control.disabled = true;
  const buttons = cell.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = true;
  });

  try {
    if (field === "status") {
      const option = statusOptions.find((item) => item.value === value);
      await updateStatus(assetId, Number(value));
      setStatusPresentation(cell, option.label);
      restoreCell(cell, option.label);
    } else if (field === "name") {
      await updateName(assetId, value);
      restoreCell(cell, value);
    } else if (field === "web-path") {
      await updateWebPath(assetId, value);
      cell.dataset.webPath = value;
      restoreCell(cell, isLocalDevelopment() ? `https://example.local${value}` : value);
    } else {
      await updateMetadata(assetId, cell.dataset.metadatafieldid, value);
      restoreCell(cell, value);
    }
    announce(`${getLabel(field)} saved.`, "success");
  } catch (error) {
    control.disabled = false;
    buttons.forEach((button) => {
      button.disabled = false;
    });
    announce(error.message || "The change could not be saved.", "error");
    control.focus();
  }
}

async function activateCell(cell) {
  if (activeCell || cell.querySelector(".editor-control")) {
    return;
  }

  const field = cell.dataset.editorField;
  const originalValue = getDisplayValue(cell);
  let editValue = originalValue;
  activeCell = cell;

  if (field === "web-path") {
    try {
      editValue = await getWebPath(cell.closest("tr")?.dataset.assetId, cell.dataset.webPath || originalValue);
    } catch (error) {
      activeCell = null;
      announce(error.message || "The web path could not be loaded.", "error");
      return;
    }
  }

  const control = makeControl(field, editValue);
  const actions = document.createElement("div");
  actions.className = "editor-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.textContent = "Save";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.className = "secondary-action";
  actions.append(save, cancel);
  cell.replaceChildren(control, actions);
  control.focus();

  save.addEventListener("click", () => saveCell(cell, field, control, originalValue));
  cancel.addEventListener("click", () => restoreCell(cell, originalValue));
  control.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      restoreCell(cell, originalValue);
    }
  });
}

if (table) {
  table.querySelectorAll(".edit_area[data-editor-field]").forEach((cell) => {
    cell.tabIndex = 0;
    cell.setAttribute("role", "button");
    cell.dataset.label = getLabel(cell.dataset.editorField);
    cell.setAttribute("aria-label", `Edit ${getLabel(cell.dataset.editorField)}`);
    if (cell.dataset.editorField === "status") {
      setStatusPresentation(cell, cell.textContent.trim());
    }
  });

  table.addEventListener("click", (event) => {
    const cell = event.target.closest(".edit_area[data-editor-field]");
    if (cell && !event.target.closest("button, input, select, textarea")) {
      activateCell(cell);
    }
  });

  table.addEventListener("keydown", (event) => {
    const cell = event.target.closest(".edit_area[data-editor-field]");
    if (cell && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      activateCell(cell);
    }
  });
}