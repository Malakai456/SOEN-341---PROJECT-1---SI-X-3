const API_BASE_URL = 'http://localhost:5001';

const state = {
  events: [],
  isLoading: false
};

const tableWrapperEl = document.querySelector('[data-table-wrapper]');
const tableEl = document.querySelector('[data-flagged-events]');
const tableBodyEl = tableEl ? tableEl.querySelector('tbody') : null;
const feedbackEl = document.querySelector('[data-status-message]');
const emptyStateEl = document.querySelector('[data-empty-state]');

const ACTION_LABELS = {
  approve: 'Approve',
  flag_for_revision: 'Flag For Revision',
  remove: 'Remove'
};

const ACTION_MESSAGES = {
  approve: 'Event approved successfully.',
  flag_for_revision: 'Event flagged for organizer revision.',
  remove: 'Event removed from the marketplace.'
};

function createLabeledParagraph(label, value) {
  const paragraph = document.createElement('p');
  const labelEl = document.createElement('strong');
  labelEl.textContent = label;
  paragraph.appendChild(labelEl);
  paragraph.appendChild(document.createTextNode(` ${value}`));
  return paragraph;
}

function setFeedback(message, type = 'info') {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.dataset.type = type;
  feedbackEl.hidden = !message;
}

function toggleEmptyState(showEmpty) {
  if (!emptyStateEl) return;
  emptyStateEl.hidden = !showEmpty;
}

function toggleTable(showTable) {
  if (!tableWrapperEl) return;
  tableWrapperEl.hidden = !showTable;
}

function formatDateTime(value) {
  if (!value) return '—';
  const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function createCell(content, className) {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  if (typeof content === 'string') {
    cell.textContent = content;
  } else if (content instanceof Node) {
    cell.appendChild(content);
  }
  return cell;
}

function buildEventRow(event) {
  const row = document.createElement('tr');
  row.dataset.eventId = String(event.event_id);

  const titleWrapper = document.createElement('div');
  titleWrapper.className = 'admin-event-primary';

  const titleEl = document.createElement('h3');
  titleEl.className = 'admin-event-title';
  titleEl.textContent = event.title || 'Untitled Event';

  titleWrapper.appendChild(titleEl);

  if (event.organization_name) {
    const orgEl = document.createElement('p');
    orgEl.className = 'admin-event-subline';
    orgEl.textContent = `Organizer • ${event.organization_name}`;
    titleWrapper.appendChild(orgEl);
  }

  if (event.description) {
    const descEl = document.createElement('p');
    descEl.className = 'admin-event-description';
    descEl.textContent = event.description;
    titleWrapper.appendChild(descEl);
  }

  const scheduleWrapper = document.createElement('div');
  scheduleWrapper.className = 'admin-event-schedule';
  scheduleWrapper.appendChild(createLabeledParagraph('Starts:', formatDateTime(event.starts_at)));
  scheduleWrapper.appendChild(createLabeledParagraph('Ends:', formatDateTime(event.ends_at)));

  const metaWrapper = document.createElement('div');
  metaWrapper.className = 'admin-event-meta';
  if (event.location_name) {
    metaWrapper.appendChild(createLabeledParagraph('Location:', event.location_name));
  }
  metaWrapper.appendChild(createLabeledParagraph('Capacity:', event.capacity || '—'));
  if (event.ticket_policy) {
    metaWrapper.appendChild(createLabeledParagraph('Ticketing:', event.ticket_policy));
  }
  const statusEl = document.createElement('span');
  statusEl.className = 'admin-status-pill';
  statusEl.textContent = (event.moderation_status || 'flagged').replace(/_/g, ' ');
  metaWrapper.appendChild(statusEl);

  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'admin-action-buttons';

  Object.entries(ACTION_LABELS).forEach(([action, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `action-button action-${action}`;
    btn.dataset.action = action;
    btn.textContent = label;
    actionsWrapper.appendChild(btn);
  });

  row.appendChild(createCell(titleWrapper, 'admin-cell-primary'));
  row.appendChild(createCell(scheduleWrapper, 'admin-cell-schedule'));
  row.appendChild(createCell(metaWrapper, 'admin-cell-meta'));
  row.appendChild(createCell(actionsWrapper, 'admin-cell-actions'));

  return row;
}

function renderFlaggedEvents(events) {
  if (!tableBodyEl) return;

  tableBodyEl.innerHTML = '';
  if (!events.length) {
    toggleTable(false);
    toggleEmptyState(true);
    return;
  }

  events.forEach((event) => {
    const row = buildEventRow(event);
    tableBodyEl.appendChild(row);
  });

  toggleEmptyState(false);
  toggleTable(true);
}

function setActionButtonsState(row, disabled) {
  const buttons = row.querySelectorAll('button[data-action]');
  buttons.forEach((btn) => {
    btn.disabled = disabled;
    btn.classList.toggle('is-loading', disabled);
  });
}

async function handleModerationAction(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;
  if (!tableBodyEl) return;

  const row = actionButton.closest('tr');
  if (!row) return;

  const eventId = Number(row.dataset.eventId);
  if (!eventId) return;

  const action = actionButton.dataset.action;
  if (!ACTION_LABELS[action]) return;

  setActionButtonsState(row, true);
  setFeedback('Updating event status…', 'info');

  try {
    const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/moderation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.message || 'Failed to update event status.';
      throw new Error(errorMessage);
    }

    state.events = state.events.filter((evt) => evt.event_id !== eventId);
    renderFlaggedEvents(state.events);
    setFeedback(ACTION_MESSAGES[action], 'success');
  } catch (err) {
    console.error('Moderation action failed:', err);
    setFeedback(err.message || 'Unexpected error updating event.', 'error');
    setActionButtonsState(row, false);
  }
}

async function loadFlaggedEvents() {
  state.isLoading = true;
  setFeedback('Loading flagged events…', 'info');

  try {
    const response = await fetch(`${API_BASE_URL}/admin/events/flagged`);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.message || 'Unable to load flagged events.';
      throw new Error(errorMessage);
    }
    const payload = await response.json();
    state.events = Array.isArray(payload) ? payload : [];
    renderFlaggedEvents(state.events);
    if (state.events.length) {
      setFeedback('', 'info');
    } else {
      setFeedback('No flagged events found.', 'success');
    }
  } catch (err) {
    console.error('Failed to fetch flagged events:', err);
    setFeedback(err.message || 'Failed to load flagged events.', 'error');
    renderFlaggedEvents([]);
  } finally {
    state.isLoading = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (tableBodyEl) {
    tableBodyEl.addEventListener('click', handleModerationAction);
  }
  loadFlaggedEvents();
});
