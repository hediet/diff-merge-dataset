export class AcceptNextWordOfInlineCompletion extends EditorAction {
	constructor() {
		super({
			id: 'editor.action.inlineSuggest.acceptNextWord',
			label: nls.localize('action.inlineSuggest.acceptNextWord', "Accept Next Word Of Inline Suggestion"),
			alias: 'Accept Next Word Of Inline Suggestion',
			precondition: ContextKeyExpr.and(EditorContextKeys.writable, GhostTextController.inlineSuggestionVisible),
			kbOpts: {
				weight: KeybindingWeight.EditorContrib + 1,
				primary: KeyMod.CtrlCmd | KeyCode.RightArrow,
			},
			menuOpts: [{
				menuId: MenuId.InlineSuggestionToolbar,
				title: 'Accept Part',
				group: 'primary',
				order: 2,
			}],
		});
	}

	public async run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void> {
		const controller = GhostTextController.get(editor);
		if (controller) {
			controller.commitPartially();
		}
	}
}