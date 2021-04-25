import type { Ref } from 'vue';
export declare type SingleTargetApi = {
    ref: (el: Element) => void;
    el: Ref<null | Element>;
};
export declare type MultipleTargetsApi = {
    getRef: (index: number) => (el: Element) => void;
    els: Ref<(null | Element)[]>;
};
export declare function useTarget(type: 'single' | 'multiple', options?: {
    effect?: () => any;
}): {
    target: Ref<null | Element>;
    handle: (el: Element) => void;
    api: SingleTargetApi;
} | {
    targets: Ref<(null | Element)[]>;
    handle: (index: number) => (el: Element) => void;
    api: MultipleTargetsApi;
};
