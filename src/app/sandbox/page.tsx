"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Plug,
  Zap,
  Box,
  MessageSquare,
  Play,
  Shield,
} from "lucide-react";
import init, {
  WasmClient as PmcpWasmClient,
} from "@/lib/wasm/mcp_management_wasm_client.js";

declare global {
  interface Window {
    __globalWasmClient?: PmcpWasmClient;
  }
}

export default function SandboxPage() {
  const [serverUrl, setServerUrl] = useState(
    "https://calculator.us-east.true-mcp.com/mcp",
  );
  const [client, setClient] = useState<PmcpWasmClient | null>(null);
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const [tools, setTools] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<
    "tools" | "resources" | "prompts" | "security"
  >("tools");
  const [auditReport, setAuditReport] = useState<any | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const [toolFormData, setToolFormData] = useState<Record<string, any>>({});
  const [promptFormData, setPromptFormData] = useState<Record<string, any>>({});
  const [toolResult, setToolResult] = useState("");
  const [resourceResult, setResourceResult] = useState("");
  const [promptResult, setPromptResult] = useState("");

  const [isCalling, setIsCalling] = useState(false);

  // Normalize values returned by the WASM client.
  // The newer `WasmClient` build uses `serde-wasm-bindgen` which serializes
  // Rust maps (e.g. `serde_json::Value::Object`, `HashMap`) as JavaScript
  // `Map` instances rather than plain objects. Our form rendering code
  // relies on plain-object property access (e.g. `tool.inputSchema.properties`
  // and `Object.entries(properties)`), so we recursively convert any `Map`
  // into a plain object here.
  const normalizeWasmValue = (value: any): any => {
    if (value === null || value === undefined) return value;
    if (value instanceof Map) {
      const obj: Record<string, any> = {};
      for (const [k, v] of value.entries()) {
        obj[String(k)] = normalizeWasmValue(v);
      }
      return obj;
    }
    if (value instanceof Set) {
      return Array.from(value).map(normalizeWasmValue);
    }
    if (Array.isArray(value)) {
      return value.map(normalizeWasmValue);
    }
    if (typeof value === "object") {
      // Skip exotic objects like ArrayBuffer / typed arrays / Dates.
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) return value;
      const obj: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        obj[k] = normalizeWasmValue(v);
      }
      return obj;
    }
    return value;
  };

  // Type helpers for schema parsing
  const NUMERIC_TYPES = [
    "integer",
    "number",
    "int",
    "float",
    "u8",
    "u16",
    "u32",
    "u64",
    "i8",
    "i16",
    "i32",
    "i64",
    "f32",
    "f64",
  ];
  const INTEGER_TYPES = [
    "integer",
    "int",
    "u8",
    "u16",
    "u32",
    "u64",
    "i8",
    "i16",
    "i32",
    "i64",
  ];
  const BOOLEAN_TYPES = ["boolean", "bool"];

  const normalizeTypeToArray = (
    type: string | string[] | undefined,
  ): string[] => {
    if (!type) return [];
    if (Array.isArray(type)) return type;
    if (typeof type === "string") return type.split(",").map((t) => t.trim());
    return [];
  };

  const isNumericSchemaType = (
    type: string | string[] | undefined,
  ): boolean => {
    return normalizeTypeToArray(type).some((t) => NUMERIC_TYPES.includes(t));
  };

  const isIntegerSchemaType = (
    type: string | string[] | undefined,
  ): boolean => {
    return normalizeTypeToArray(type).some((t) => INTEGER_TYPES.includes(t));
  };

  const isBooleanSchemaType = (
    type: string | string[] | undefined,
  ): boolean => {
    return normalizeTypeToArray(type).some((t) => BOOLEAN_TYPES.includes(t));
  };

  interface FormField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: any;
  }

  const getToolFormFields = (toolName: string): FormField[] => {
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) return [];

    const properties = tool.inputSchema?.properties || {};
    const required = tool.inputSchema?.required || [];

    return Object.entries(properties).map(([name, schema]: [string, any]) => {
      let normalizedType = schema.type;
      if (isNumericSchemaType(schema.type)) normalizedType = "number";
      else if (isBooleanSchemaType(schema.type)) normalizedType = "boolean";

      return {
        name,
        label: name
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        type: normalizedType,
        required: required.includes(name),
        description: schema.description,
        defaultValue: schema.default,
      };
    });
  };

  const getPromptFormFields = (promptName: string): FormField[] => {
    const prompt = prompts.find((p) => p.name === promptName);
    if (!prompt) return [];

    return (prompt.arguments || []).map((arg: any) => ({
      name: arg.name,
      label: arg.name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
      type: "string",
      required: arg.required || false,
      description: arg.description,
    }));
  };

  // Initialize WASM on mount and intercept fetch to log payloads
  useEffect(() => {
    // Intercept fetch to help debug the "Unknown message type" error
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      if (args[1] && typeof args[1] === "object" && args[1].body) {
        let bodySnippet = args[1].body;
        if (typeof bodySnippet === "string") {
          try {
            const parsed = JSON.parse(bodySnippet);
            addLog(
              `-> [OUTGOING HTTP POST]: ${JSON.stringify(parsed)}`,
              "system",
            );
          } catch (e) {
            addLog(`-> [OUTGOING HTTP POST RAW]: ${bodySnippet}`, "system");
          }
        }
      }
      const response = await originalFetch(...args);
      // We don't intercept response.clone().text() because it might break streaming, but we logged the request.
      return response;
    };

    init("/wasm/mcp_management_wasm_client_bg.wasm")
      .then(() => {
        addLog("WASM module loaded successfully.", "system");
      })
      .catch((e) => {
        addLog(`Failed to load WASM module: ${e.message}`, "error");
      });

    return () => {
      window.fetch = originalFetch; // cleanup
    };
  }, []);

  const addLog = (msg: string, type: "info" | "error" | "system" = "info") => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${msg}`,
    ]);
  };

  const handleConnect = async () => {
    if (!serverUrl) return;

    setStatus("connecting");
    setErrorMsg("");
    setAuditReport(null);
    addLog(`Connecting to ${serverUrl}...`);

    try {
      if (window.__globalWasmClient) {
        window.__globalWasmClient.free();
        window.__globalWasmClient = undefined;
      }

      window.__globalWasmClient = new PmcpWasmClient();
      const activeClient = window.__globalWasmClient;
      await activeClient.connect(serverUrl);

      setClient(activeClient);
      setStatus("connected");
      addLog(`Successfully connected to ${serverUrl}`, "system");

      // Fetch initial data
      await fetchData(activeClient);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(
        err.message ||
          "Failed to connect. Ensure the URL is a valid MCP endpoint supporting HTTP POST.",
      );
      addLog(`Connection failed: ${err.message}`, "error");
      setClient(null);
    }
  };

  const handleDisconnect = () => {
    setClient(null);
    setStatus("disconnected");
    setTools([]);
    setSelectedTool(null);
    setToolResult("");
    setAuditReport(null);
    addLog("Disconnected from server.", "system");
  };

  const fetchData = async (mcpClient: PmcpWasmClient) => {
    try {
      addLog("Fetching available tools...");
      const fetchedTools =
        normalizeWasmValue(await mcpClient.list_tools()) || [];
      setTools(Array.isArray(fetchedTools) ? fetchedTools : []);
      addLog(
        `Found ${Array.isArray(fetchedTools) ? fetchedTools.length : 0} tools.`,
      );

      addLog("Fetching available resources...");
      try {
        const fetchedResources =
          normalizeWasmValue(await mcpClient.list_resources()) || [];
        setResources(Array.isArray(fetchedResources) ? fetchedResources : []);
        addLog(
          `Found ${Array.isArray(fetchedResources) ? fetchedResources.length : 0} resources.`,
        );
      } catch (e) {
        addLog("Resources not supported by server.");
      }

      addLog("Fetching available prompts...");
      try {
        const fetchedPrompts =
          normalizeWasmValue(await mcpClient.list_prompts()) || [];
        setPrompts(Array.isArray(fetchedPrompts) ? fetchedPrompts : []);
        addLog(
          `Found ${Array.isArray(fetchedPrompts) ? fetchedPrompts.length : 0} prompts.`,
        );
      } catch (e) {
        addLog("Prompts not supported by server.");
      }
    } catch (err: any) {
      addLog(`Failed to fetch data: ${err.message}`, "error");
    }
  };

  const handleCallTool = async () => {
    if (!client || !selectedTool) return;

    setIsCalling(true);
    setToolResult("");
    addLog(`Calling tool: ${selectedTool}`);

    try {
      const toolDef = tools.find((t) => t.name === selectedTool);
      const coercedArgs: Record<string, any> = {};
      const properties = toolDef?.inputSchema?.properties || {};

      for (const [key, value] of Object.entries(toolFormData)) {
        const schema = properties[key];
        const schemaType = schema?.type;

        if (schema) {
          if (isNumericSchemaType(schemaType)) {
            const numValue = Number(value);
            if (!isNaN(numValue) && value !== "" && value !== undefined) {
              coercedArgs[key] = isIntegerSchemaType(schemaType)
                ? Math.floor(numValue)
                : numValue;
            }
          } else if (isBooleanSchemaType(schemaType)) {
            coercedArgs[key] = Boolean(value);
          } else if (schemaType === "array" || schemaType === "object") {
            if (typeof value === "string") {
              try {
                coercedArgs[key] = JSON.parse(value);
              } catch {
                if (schemaType === "array") {
                  coercedArgs[key] = value
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                } else {
                  coercedArgs[key] = value;
                }
              }
            } else {
              coercedArgs[key] = value;
            }
          } else {
            if (value !== "" && value !== undefined) {
              coercedArgs[key] = value;
            }
          }
        } else if (value !== "" && value !== undefined) {
          coercedArgs[key] = value;
        }
      }

      const result = normalizeWasmValue(
        await client.call_tool(selectedTool, coercedArgs),
      );
      setToolResult(JSON.stringify(result, null, 2));
      addLog(`Tool ${selectedTool} executed successfully.`, "system");
    } catch (err: any) {
      setToolResult(`Error: ${err.message}`);
      addLog(`Tool execution failed: ${err.message}`, "error");
    } finally {
      setIsCalling(false);
    }
  };

  const handleReadResource = async () => {
    if (!client || !selectedResource) return;

    setIsCalling(true);
    setResourceResult("");
    addLog(`Reading resource: ${selectedResource}`);

    try {
      const result = normalizeWasmValue(
        await client.read_resource(selectedResource),
      );
      setResourceResult(JSON.stringify(result, null, 2));
      addLog(`Resource ${selectedResource} read successfully.`, "system");
    } catch (err: any) {
      setResourceResult(`Error: ${err.message}`);
      addLog(`Resource read failed: ${err.message}`, "error");
    } finally {
      setIsCalling(false);
    }
  };

  const handleGetPrompt = async () => {
    if (!client || !selectedPrompt) return;

    setIsCalling(true);
    setPromptResult("");
    addLog(`Getting prompt: ${selectedPrompt}`);

    try {
      const result = normalizeWasmValue(
        await client.get_prompt(selectedPrompt, promptFormData),
      );
      setPromptResult(JSON.stringify(result, null, 2));
      addLog(`Prompt ${selectedPrompt} retrieved successfully.`, "system");
    } catch (err: any) {
      setPromptResult(`Error: ${err.message}`);
      addLog(`Prompt retrieval failed: ${err.message}`, "error");
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header section */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-4 tracking-tight">
            <Terminal className="w-8 h-8 text-lcars-orange" />
            MCP Sandbox
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Powered by the{" "}
            <span className="text-white font-semibold">
              Rust PMCP WASM Client
            </span>
            . Connect directly to any stateless HTTP MCP server from your
            browser.
          </p>
        </div>

        {/* Connection Panel */}
        <div className="glass-card p-6 border-l-4 border-l-lcars-blue flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-mono text-gray-400">
                SERVER_URL
              </label>
              <select
                className="bg-black/50 border border-white/20 rounded text-xs text-gray-400 p-1 outline-none focus:border-lcars-blue disabled:opacity-50"
                onChange={(e) => {
                  if (e.target.value) setServerUrl(e.target.value);
                }}
                value=""
                disabled={status === "connected" || status === "connecting"}
              >
                <option value="" disabled>
                  -- Load Example --
                </option>
                <option value="https://calculator.us-east.true-mcp.com/mcp">
                  Calculator
                </option>
                <option value="https://london-tube.us-east.true-mcp.com/mcp">
                  London Tube
                </option>
                <option value="https://reinvent.us-east.true-mcp.com/mcp">
                  AWS re:Invent
                </option>
              </select>
            </div>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              disabled={status === "connected" || status === "connecting"}
              className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-lcars-blue font-mono disabled:opacity-50"
              placeholder="https://your-mcp-server.com/mcp"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {status !== "connected" ? (
              <button
                onClick={handleConnect}
                disabled={status === "connecting"}
                className="bg-lcars-blue hover:bg-blue-400 text-black font-bold px-8 py-3 rounded-md transition-all flex items-center gap-2 disabled:opacity-50 flex-grow justify-center"
              >
                {status === "connecting" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <Plug className="w-5 h-5" />
                )}
                Connect
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="glass-card hover:bg-white/10 text-white font-bold px-8 py-3 rounded-md transition-all flex items-center gap-2 flex-grow justify-center"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md font-mono text-sm">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Work Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-2 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("tools")}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${activeTab === "tools" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                <Zap className="w-4 h-4" /> Tools
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${activeTab === "resources" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                <Box className="w-4 h-4" /> Resources
              </button>
              <button
                onClick={() => setActiveTab("prompts")}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${activeTab === "prompts" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                <MessageSquare className="w-4 h-4" /> Prompts
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${activeTab === "security" ? "bg-lcars-red/20 text-lcars-red" : "text-gray-500 hover:text-lcars-red/50"}`}
              >
                <Shield className="w-4 h-4" /> Security & Pentest
              </button>
            </div>

            <div className="glass-card min-h-[400px] p-6 relative">
              {status !== "connected" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 rounded-xl">
                  <span className="font-mono text-gray-500 border border-white/10 bg-black/50 px-4 py-2 rounded-md">
                    Awaiting Connection...
                  </span>
                </div>
              )}

              {activeTab === "tools" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[400px]">
                  {/* Tool List Sidebar */}
                  <div className="md:col-span-2 border-r border-white/10 pr-6 space-y-2 max-h-[600px] overflow-y-auto">
                    <h3 className="font-mono text-xs text-gray-500 mb-4 tracking-wider">
                      AVAILABLE_TOOLS
                    </h3>
                    {tools.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTool(t.name);
                          setToolFormData({});
                          setToolResult("");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedTool === t.name ? "bg-lcars-blue/20 border-l-2 border-lcars-blue text-white" : "hover:bg-white/5 text-gray-400"}`}
                      >
                        <div className="font-mono font-semibold text-sm truncate">
                          {t.name}
                        </div>
                      </button>
                    ))}
                    {tools.length === 0 && status === "connected" && (
                      <div className="text-gray-500 text-sm italic">
                        No tools found.
                      </div>
                    )}
                  </div>

                  {/* Tool Execution Panel */}
                  <div className="md:col-span-3 flex flex-col">
                    {selectedTool ? (
                      <>
                        <h3 className="font-bold text-lg mb-2 text-lcars-orange">
                          {selectedTool}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {
                            tools.find((t) => t.name === selectedTool)
                              ?.description
                          }
                        </p>

                        <div className="space-y-4 mb-4">
                          {getToolFormFields(selectedTool).map((field) => (
                            <div
                              key={field.name}
                              className="bg-black/20 p-3 rounded-md border border-white/5"
                            >
                              <label className="block text-xs font-mono text-gray-300 mb-1">
                                {field.label}{" "}
                                {field.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </label>
                              {field.description && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {field.description}
                                </p>
                              )}
                              {field.type === "boolean" ? (
                                <input
                                  type="checkbox"
                                  checked={
                                    toolFormData[field.name] ??
                                    field.defaultValue ??
                                    false
                                  }
                                  onChange={(e) =>
                                    setToolFormData((prev) => ({
                                      ...prev,
                                      [field.name]: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4 accent-lcars-orange"
                                />
                              ) : field.type === "number" ||
                                field.type === "integer" ? (
                                <input
                                  type="number"
                                  value={
                                    toolFormData[field.name] ??
                                    field.defaultValue ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setToolFormData((prev) => ({
                                      ...prev,
                                      [field.name]: e.target.valueAsNumber,
                                    }))
                                  }
                                  className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 font-mono text-sm text-white focus:border-lcars-orange focus:outline-none"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={
                                    toolFormData[field.name] ??
                                    field.defaultValue ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setToolFormData((prev) => ({
                                      ...prev,
                                      [field.name]: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 font-mono text-sm text-white focus:border-lcars-orange focus:outline-none"
                                />
                              )}
                            </div>
                          ))}
                          {getToolFormFields(selectedTool).length === 0 && (
                            <div className="text-xs text-gray-500 italic mb-4">
                              This tool takes no arguments.
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleCallTool}
                          disabled={isCalling}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 mb-4"
                        >
                          {isCalling ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Execute Tool
                        </button>

                        <label className="text-xs font-mono text-gray-500 mb-1">
                          RESULT
                        </label>
                        <div className="flex-grow bg-black/80 border border-white/10 rounded-md p-3 overflow-y-auto font-mono text-sm">
                          {toolResult ? (
                            <pre className="text-gray-300 whitespace-pre-wrap">
                              {toolResult}
                            </pre>
                          ) : (
                            <span className="text-gray-600 italic">
                              Waiting for execution...
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 italic">
                        Select a tool to execute
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[400px]">
                  <div className="md:col-span-2 border-r border-white/10 pr-6 space-y-2 max-h-[600px] overflow-y-auto">
                    <h3 className="font-mono text-xs text-gray-500 mb-4 tracking-wider">
                      AVAILABLE_RESOURCES
                    </h3>
                    {resources.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedResource(r.uri);
                          setResourceResult("");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedResource === r.uri ? "bg-lcars-blue/20 border-l-2 border-lcars-blue text-white" : "hover:bg-white/5 text-gray-400"}`}
                      >
                        <div className="font-mono font-semibold text-sm truncate">
                          {r.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {r.uri}
                        </div>
                      </button>
                    ))}
                    {resources.length === 0 && status === "connected" && (
                      <div className="text-gray-500 text-sm italic">
                        No resources found.
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3 flex flex-col">
                    {selectedResource ? (
                      <>
                        <h3 className="font-bold text-lg mb-2 text-lcars-orange">
                          {
                            resources.find((r) => r.uri === selectedResource)
                              ?.name
                          }
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {
                            resources.find((r) => r.uri === selectedResource)
                              ?.description
                          }
                        </p>
                        <button
                          onClick={handleReadResource}
                          disabled={isCalling}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 mb-4"
                        >
                          {isCalling ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Read Resource
                        </button>
                        <label className="text-xs font-mono text-gray-500 mb-1">
                          CONTENT
                        </label>
                        <div className="flex-grow bg-black/80 border border-white/10 rounded-md p-3 overflow-y-auto font-mono text-sm">
                          {resourceResult ? (
                            <pre className="text-gray-300 whitespace-pre-wrap">
                              {resourceResult}
                            </pre>
                          ) : (
                            <span className="text-gray-600 italic">
                              Waiting for execution...
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 italic">
                        Select a resource to read
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "prompts" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[400px]">
                  <div className="md:col-span-2 border-r border-white/10 pr-6 space-y-2 max-h-[600px] overflow-y-auto">
                    <h3 className="font-mono text-xs text-gray-500 mb-4 tracking-wider">
                      AVAILABLE_PROMPTS
                    </h3>
                    {prompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPrompt(p.name);
                          setPromptFormData({});
                          setPromptResult("");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedPrompt === p.name ? "bg-lcars-blue/20 border-l-2 border-lcars-blue text-white" : "hover:bg-white/5 text-gray-400"}`}
                      >
                        <div className="font-mono font-semibold text-sm truncate">
                          {p.name}
                        </div>
                      </button>
                    ))}
                    {prompts.length === 0 && status === "connected" && (
                      <div className="text-gray-500 text-sm italic">
                        No prompts found.
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3 flex flex-col">
                    {selectedPrompt ? (
                      <>
                        <h3 className="font-bold text-lg mb-2 text-lcars-orange">
                          {selectedPrompt}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {
                            prompts.find((p) => p.name === selectedPrompt)
                              ?.description
                          }
                        </p>

                        <div className="space-y-4 mb-4">
                          {getPromptFormFields(selectedPrompt).map((field) => (
                            <div
                              key={field.name}
                              className="bg-black/20 p-3 rounded-md border border-white/5"
                            >
                              <label className="block text-xs font-mono text-gray-300 mb-1">
                                {field.label}{" "}
                                {field.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </label>
                              {field.description && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {field.description}
                                </p>
                              )}
                              <input
                                type="text"
                                value={promptFormData[field.name] ?? ""}
                                onChange={(e) =>
                                  setPromptFormData((prev) => ({
                                    ...prev,
                                    [field.name]: e.target.value,
                                  }))
                                }
                                className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 font-mono text-sm text-white focus:border-lcars-yellow focus:outline-none"
                              />
                            </div>
                          ))}
                          {getPromptFormFields(selectedPrompt).length === 0 && (
                            <div className="text-xs text-gray-500 italic mb-4">
                              This prompt takes no arguments.
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleGetPrompt}
                          disabled={isCalling}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 mb-4"
                        >
                          {isCalling ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Get Prompt
                        </button>
                        <label className="text-xs font-mono text-gray-500 mb-1">
                          MESSAGES
                        </label>
                        <div className="flex-grow bg-black/80 border border-white/10 rounded-md p-3 overflow-y-auto font-mono text-sm">
                          {promptResult ? (
                            <pre className="text-gray-300 whitespace-pre-wrap">
                              {promptResult}
                            </pre>
                          ) : (
                            <span className="text-gray-600 italic">
                              Waiting for execution...
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 italic">
                        Select a prompt to retrieve
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="min-h-[400px] flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-lcars-red flex items-center gap-2">
                      <Shield className="w-6 h-6" /> Security Static Analysis
                    </h3>
                    <button
                      onClick={async () => {
                        if (!client) return;
                        setIsCalling(true);
                        setAuditReport(null);
                        addLog("Running static analysis pentest...", "system");
                        try {
                          // @ts-ignore - method mapped dynamically from WASM
                          const report = normalizeWasmValue(
                            await client.pentest_tools(),
                          );
                          setAuditReport(report);
                          addLog(
                            `Pentest complete. Found ${report?.findings?.length || 0} issues.`,
                            report?.findings?.length > 0 ? "error" : "info",
                          );
                        } catch (e: any) {
                          addLog(`Pentest failed: ${e.message}`, "error");
                        } finally {
                          setIsCalling(false);
                        }
                      }}
                      disabled={isCalling || status !== "connected"}
                      className="bg-lcars-red/20 hover:bg-lcars-red/40 border border-lcars-red/50 text-white font-bold py-2 px-6 rounded-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isCalling ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Run Analysis
                    </button>
                    <button
                      onClick={async () => {
                        if (!client) return;
                        setIsCalling(true);
                        addLog("Starting dynamic security analysis...", "info");
                        setAuditReport(null);

                        try {
                          // @ts-ignore
                          const report = normalizeWasmValue(
                            await client.run_dynamic_pentest(),
                          );
                          setAuditReport(report);
                          addLog(
                            `Dynamic pentest complete. Found ${report?.findings?.length || 0} issues.`,
                            report?.findings?.length > 0 ? "error" : "info",
                          );
                        } catch (e: any) {
                          addLog(`Dynamic pentest failed: ${e.message}`, "error");
                        } finally {
                          setIsCalling(false);
                        }
                      }}
                      disabled={isCalling || status !== "connected"}
                      className="bg-orange-500/20 hover:bg-orange-500/40 border border-orange-500/50 text-orange-200 font-bold py-2 px-6 rounded-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isCalling ? (
                        <div className="w-4 h-4 rounded-full border-2 border-orange-200 border-t-transparent animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Run Dynamic Analysis
                    </button>
                  </div>

                  {auditReport === null ? (
                    <div className="flex-grow flex items-center justify-center w-full bg-black/30 rounded-lg border border-white/5 p-12 text-center text-gray-500">
                      <p>
                        Run static analysis to scan tools for hidden
                        instructions, unexpected metadata, and script
                        injections.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full space-y-8">
                      {/* Tests Executed Section */}
                      <div className="bg-black/30 border border-white/10 rounded-lg p-6">
                        <h4 className="font-mono text-sm font-bold text-gray-400 mb-4 tracking-wider">
                          TESTS EXECUTED
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {auditReport.tests_run?.map(
                            (test: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-black/50 p-3 rounded border border-white/5"
                              >
                                <div>
                                  <div className="font-bold text-gray-200">
                                    {test.id}: {test.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {test.description}
                                  </div>
                                </div>
                                <div
                                  className={`px-3 py-1 rounded text-xs font-bold ${test.status === "Pass" ? "bg-green-900/40 text-green-400 border border-green-500/30" : "bg-red-900/40 text-red-400 border border-red-500/30"}`}
                                >
                                  {test.status}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Findings Section */}
                      {auditReport.findings?.length === 0 ? (
                        <div className="flex items-center justify-center w-full bg-green-900/20 border border-green-500/30 rounded-lg p-12 text-center text-green-400">
                          <div className="space-y-4">
                            <Shield className="w-16 h-16 mx-auto opacity-50" />
                            <h4 className="text-2xl font-bold">All Clear</h4>
                            <p>
                              No static security issues detected in the
                              available tools.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="font-mono text-sm font-bold text-lcars-red tracking-wider">
                            SECURITY FINDINGS
                          </h4>
                          {auditReport.findings?.map(
                            (finding: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-black/40 border border-lcars-red/30 rounded-md p-4 flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-lcars-red text-lg">
                                    {finding.id}: {finding.name}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 text-xs font-bold rounded-sm ${finding.severity === "Critical" ? "bg-red-900/50 text-red-400 border border-red-500/50" : "bg-orange-900/50 text-orange-400 border border-orange-500/50"}`}
                                  >
                                    {finding.severity}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm">
                                  {finding.description}
                                </p>
                                <div className="bg-black/60 p-2 rounded border border-white/10 font-mono text-xs text-gray-400 break-all">
                                  {finding.evidence}
                                </div>
                                <div className="text-xs text-lcars-blue mt-2">
                                  <span className="font-bold">
                                    Remediation:
                                  </span>{" "}
                                  {finding.remediation}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* System Logs */}
          <div className="glass-card flex flex-col h-[calc(100vh-8rem)] sticky top-24">
            <div className="border-b border-white/10 p-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-sm font-semibold tracking-wider">
                SYSTEM_LOGS
              </span>
            </div>
            <div className="flex-grow p-4 overflow-y-auto font-mono text-xs space-y-2 bg-black/30">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.includes("[ERROR]")
                      ? "text-red-400"
                      : log.includes("[SYSTEM]")
                        ? "text-lcars-blue"
                        : "text-gray-400"
                  }`}
                >
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-600">Waiting for activity...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
