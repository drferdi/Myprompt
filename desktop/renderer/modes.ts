import {
  PRODUCT_SURFACE,
  type ProductCommandId,
  type ProductPrimaryModeId,
} from '../../lib/desktop/product-surface'

export type DesktopPrimaryModeId = ProductPrimaryModeId
export type DesktopCommandId = ProductCommandId

export const PRIMARY_MODES = PRODUCT_SURFACE.primaryModes
export const COMMAND_GROUPS = PRODUCT_SURFACE.commandGroups
