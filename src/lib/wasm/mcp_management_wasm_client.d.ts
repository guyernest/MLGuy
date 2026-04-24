/* tslint:disable */
/* eslint-disable */

/**
 * Connection type for the WASM client
 */
export enum ConnectionType {
    WebSocket = 0,
    Http = 1,
}

/**
 * WASM MCP Client that supports both HTTP and WebSocket transports
 */
export class WasmClient {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Call a tool on the server
     */
    call_tool(name: string, args: any): Promise<any>;
    /**
     * Connect to an MCP server.
     * - URLs starting with ws:// or wss:// will use WebSocket
     * - URLs starting with http:// or https:// will use HTTP
     */
    connect(url: string): Promise<void>;
    /**
     * Get the connection type
     */
    connection_type(): ConnectionType | undefined;
    /**
     * Get a prompt with arguments using pmcp
     */
    get_prompt(name: string, args: any): Promise<any>;
    /**
     * List all available prompts using pmcp
     */
    list_prompts(): Promise<any>;
    /**
     * List all available resources using pmcp
     */
    list_resources(): Promise<any>;
    /**
     * List available tools from the server
     */
    list_tools(): Promise<any>;
    constructor();
    /**
     * Run security static analysis on available tools
     */
    pentest_tools(): Promise<any>;
    /**
     * Read a specific resource using pmcp
     */
    read_resource(uri: string): Promise<any>;
    /**
     * Get the current session ID (if any)
     */
    session_id(): string | undefined;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_wasmclient_free: (a: number, b: number) => void;
    readonly wasmclient_call_tool: (a: number, b: number, c: number, d: any) => any;
    readonly wasmclient_connect: (a: number, b: number, c: number) => any;
    readonly wasmclient_connection_type: (a: number) => number;
    readonly wasmclient_get_prompt: (a: number, b: number, c: number, d: any) => any;
    readonly wasmclient_list_prompts: (a: number) => any;
    readonly wasmclient_list_resources: (a: number) => any;
    readonly wasmclient_list_tools: (a: number) => any;
    readonly wasmclient_new: () => number;
    readonly wasmclient_pentest_tools: (a: number) => any;
    readonly wasmclient_read_resource: (a: number, b: number, c: number) => any;
    readonly wasmclient_session_id: (a: number) => [number, number];
    readonly wasm_bindgen__closure__destroy__h2a49f2a649c02cd9: (a: number, b: number) => void;
    readonly wasm_bindgen__closure__destroy__hd1b7083cbbf89312: (a: number, b: number) => void;
    readonly wasm_bindgen__closure__destroy__hb30e6d3eb60b0ff8: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hf11f4cc1220e5b79: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h4acbbe1f35c4227a: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h16392182bf61eca8: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h16392182bf61eca8_3: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hfd6e98e0e4ae7560: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
