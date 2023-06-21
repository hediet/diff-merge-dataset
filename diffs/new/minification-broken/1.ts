    if (edit) {
        this.resultTextModel.pushStackElement();
        this.resultTextModelDiffs.applyEditRelativeToOriginal(edit, tx, group);
        this.resultTextModel.pushStackElement();
    }