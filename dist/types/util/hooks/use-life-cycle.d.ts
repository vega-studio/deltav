type WillUnmount = () => void;
/**
 * A target that wishes to interact with a component's lifecycle.
 */
export interface ILifecycle {
    /**
     * Component is about to perform it's first render but has not yet.
     *
     * Return false to indicate the component will not have the correct state
     * information to render correctly.
     */
    willMount?(): boolean;
    /** Component finished it's first render */
    didMount?(): WillUnmount | undefined | void | Promise<WillUnmount | undefined | void>;
    /**
     * Only executes on renders AFTER the component has mounted. Thus, will not
     * run first render. This DOES run before the current render pass has
     * completed.
     *
     * The returned async function will execute AFTER the current render pass has
     * executed, thus getting close to being a didUpdate (not 'exactly' the same
     * as a class component lifecycle, but very close. Expect nuances)
     */
    willUpdate?(): (() => Promise<void>) | undefined | void;
}
/**
 * This hook allows a target object to react to a component's lifecycle.
 * Typically this will be used for a UI Store object to hydrate and dispose
 * itself cleanly.
 *
 * The result of this hook is a boolean that indicates the component is capable
 * of rendering. The willMount method determines if the component is capable to
 * render. If it returns false, the component should not render or should render
 * in a state that indicates the component will fail to have the correct
 * information to display.
 */
export declare function useLifecycle<TStore extends ILifecycle>(target: TStore, remount?: React.DependencyList): {
    store: TStore;
    shouldMount: boolean;
};
export {};
