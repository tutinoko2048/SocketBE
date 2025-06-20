import type { HookParameters, StarlightPlugin } from '@astrojs/starlight/types';



export default function starlightTypeDocSidebarPlugin(
  options: StarlightTypeDocSidebarPluginOptions,
): StarlightPlugin {
  return {
    name: 'starlight-typedoc-sidebar-plugin',
    hooks: {
      async 'config:setup'({ config, updateConfig }) {
        const sidebar = config.sidebar?.find((item) => typeof item !== 'string' && item.label === options.label);
        if (!sidebar) {
          throw new Error(`Sidebar with label "${options.label}" not found.`);
        }
        
        sidebar

        updateConfig({ sidebar: config.sidebar });
      },
    },
  }
}

export interface StarlightTypeDocSidebarPluginOptions {
  label: string;
}

export function isSidebarManualGroup(
  item: NonNullable<StarlightUserConfigSidebar>[number],
): item is SidebarManualGroup {
  return typeof item === 'object' && 'items' in item;
}

interface SidebarManualGroup {
  label: string;
}


type StarlightUserConfigSidebar = HookParameters<'config:setup'>['config']['sidebar'];