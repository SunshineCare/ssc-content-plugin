# Running the SSC workflows in ChatGPT

The plugin ships to **Cowork / Claude Code**. This document covers the *other*
route: adding Brand OS to **ChatGPT** as a connector, so an operator can run the
same 11 workflows there.

## What ChatGPT gets, and what it does not

ChatGPT has no slash commands, no subagents, and does not surface MCP prompts.
Its only channel is **tools**. So the workflows — which in Cowork are prose the
harness loads for you — reach ChatGPT as three read tools on the Brand OS MCP
server:

| Tool | Returns |
|---|---|
| `list_workflows` | the 11 workflows, their arguments and step names |
| `get_workflow` | one workflow's command prose + the agent/skill that orchestrates it |
| `get_workflow_step` | one step's full skill prose |

A ChatGPT session walks those three by hand where Cowork dispatches
automatically:

```
list_workflows()            → pick /ssc-ad
get_workflow('ssc-ad')      → the entry-point instructions
get_workflow_step('ssc-ads-writer')  → the skill that writes the copy
```

Everything else — `get_brief`, `save_content`, `list_ideas`, … — is the same
tool surface Cowork uses.

**Two things are genuinely absent in ChatGPT.** Say them out loud rather than
discovering them:

1. **No `approval-gate.mjs`.** That PreToolUse hook is a Claude Code mechanism;
   ChatGPT has no equivalent. The propose-only invariant therefore rests on the
   two layers that were always authoritative — the server-side `approve`
   capability, and the prose in every workflow. Every workflow result repeats
   the invariant for that reason.
2. **No automatic skill loading.** If the model does not call
   `get_workflow_step`, it will improvise the step instead of running it. The
   tool descriptions push hard on this, but a session that starts producing copy
   without having fetched the skill is producing something else.

## Adding the connector (operator, once)

Nothing needs to be built or deployed for auth — Brand OS already speaks the
discovery protocol ChatGPT expects:

- Protected Resource Metadata: `https://ssc.sunshinecare.vn/bos/.well-known/oauth-protected-resource`
- Authorization Server Metadata: `https://ssc.sunshinecare.vn/.well-known/oauth-authorization-server`
- Dynamic Client Registration at `https://ssc.sunshinecare.vn/register`, PKCE `S256`

ChatGPT registers itself dynamically, so — unlike the Cowork plugin, which pins
`clientId: ssc-content-plugin` — there is **no client id to configure**.

1. ChatGPT → **Settings → Connectors → Advanced → Developer mode**.
2. **Create** a connector with the MCP server URL:
   `https://ssc.sunshinecare.vn/bos/mcp`
3. Authentication: **OAuth**. ChatGPT discovers the endpoints and opens the SSC
   consent page; sign in with the operator account that has Brand OS access.
4. Enable the connector in a chat, then confirm with:
   *"call list_workflows"* — it should come back with 11 workflows and the
   plugin version.

Capabilities follow the operator's SSC position exactly as they do in Cowork: a
`consultant` gets `view`, a `director` gets `view/edit/approve/admin`. The
connector changes who is asking, never what they are allowed to do.

## Keeping ChatGPT and Cowork in step

The bundle ChatGPT reads is **generated from this repo's skills**, so the two
harnesses cannot drift silently:

```bash
scripts/build-chatgpt-bundle.mjs           # chatgpt/workflows.json ← plugins/ssc/**
scripts/publish-chatgpt-bundle.sh          # mirror it into content/mcp-server/
scripts/publish-chatgpt-bundle.sh --check  # exit 1 if the mirror is stale
```

**Editing a skill is not enough.** A prose change reaches Cowork on the next
`claude plugin update`, but reaches ChatGPT only when the bundle is republished
**and the Brand OS server is redeployed**. So a change to any command, agent or
skill means:

1. bump `plugins/ssc/.claude-plugin/plugin.json` (as always), and
2. run `scripts/publish-chatgpt-bundle.sh`, then commit the refreshed mirror in
   the `content` repo and deploy brandos-express.

Run `--check` before committing a skill change. Never hand-edit
`content/mcp-server/lib/brandos/workflows/workflows.json` — the next publish
overwrites it.

## Known rough edges

- **Tool count.** The connector exposes ~68 tools plus the generic
  `approve`/`edit`/`delete` verbs. That is a lot of surface for a model to pick
  from; if selection gets unreliable, narrowing the connector's enabled tools is
  the first lever.
- **Step size.** Some skills are large (`ssc-ads-writer` is ~94 KB of prose).
  One `get_workflow_step` call is a real chunk of context — fetch the step you
  are about to work, not the whole pipeline up front.
