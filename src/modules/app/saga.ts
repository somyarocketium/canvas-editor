import { Action } from "@reduxjs/toolkit";
import deepDiff from "deep-diff";
import { call, put, takeEvery } from "redux-saga/effects";
import { Artboard } from "../../types";
import { updateStateHistory } from "../history/actions";
import { Delta } from "../history/reducer";
import { appStart, initState, setArtboards, setSelectedArtboard, updateArtboards } from "./actions";

function* initStateSaga() {
  const savedState: string = yield call([localStorage, "getItem"], "artboards");
  const initialState: Artboard[] = savedState
    ? JSON.parse(savedState)
    : undefined;

  yield put(initState(initialState));

  // Save the initial state in history redux
  const diff = deepDiff.diff([], initialState);

  if (!diff) {
    console.log("no diff");
    return;
  }

  const delta: Delta = {
    actionType: appStart.type,
    diff,
  };
  yield put(updateStateHistory(delta));

  // Set selected artboard to the first artboard
  if (initialState && initialState.length > 0) {
    yield put(setSelectedArtboard(initialState[0]));
  }
}

function* setArtboardsSaga(action: Action) {
  if (!setArtboards.match(action)) {
    return;
  }

  const artboards = action.payload;
  const serializedState = JSON.stringify(artboards);
  yield call([localStorage, "setItem"], "artboards", serializedState);
  // Save the difference between the current state and the previous state in history redux
  yield put(updateArtboards(action.payload));
}

function* applicationSaga() {
  yield takeEvery(appStart.type, initStateSaga);
  yield takeEvery(setArtboards.type, setArtboardsSaga);
}

export default applicationSaga;
