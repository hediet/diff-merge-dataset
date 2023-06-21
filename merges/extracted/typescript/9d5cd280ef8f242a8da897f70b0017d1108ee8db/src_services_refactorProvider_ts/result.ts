/* @internal */
namespace ts.refactor {
    // A map with the refactor code as key, the refactor itself as value
    // e.g.  nonSuggestableRefactors[refactorCode] -> the refactor you want
<<<<<<< HEAD
    const refactors: Map<string, Refactor> = new Map<string, Refactor>();
=======
    const refactors: ESMap<string, Refactor> = createMap<Refactor>();
>>>>>>> b100680a3eebf85dfdf2de04f1d096e454866dd0

    /** @param name An unique code associated with each refactor. Does not have to be human-readable. */
    export function registerRefactor(name: string, refactor: Refactor) {
        refactors.set(name, refactor);
    }

    export function getApplicableRefactors(context: RefactorContext): ApplicableRefactorInfo[] {
        return arrayFrom(flatMapIterator(refactors.values(), refactor =>
            context.cancellationToken && context.cancellationToken.isCancellationRequested() ? undefined : refactor.getAvailableActions(context)));
    }

    export function getEditsForRefactor(context: RefactorContext, refactorName: string, actionName: string): RefactorEditInfo | undefined {
        const refactor = refactors.get(refactorName);
        return refactor && refactor.getEditsForAction(context, actionName);
    }
}
