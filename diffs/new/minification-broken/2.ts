if (edit) {
    if (pushStackElement) {
        this.resultTextModel.pushStackElement();
    }
    this.resultTextModelDiffs.applyEditRelativeToOriginal(edit, transaction);
    if (pushStackElement) {
        this.resultTextModel.pushStackElement();
    }
}