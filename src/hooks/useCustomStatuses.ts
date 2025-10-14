/**
 * DEPRECATED: This hook has been replaced by StatusContext to prevent multiple simultaneous API calls.
 *
 * Instead of importing from this file, use the Context:
 * ```
 * import { useCustomStatuses } from '../contexts/StatusContext';
 * ```
 *
 * This file is kept for backwards compatibility but will be removed in a future version.
 * The hook now simply re-exports from StatusContext.
 */

export { useCustomStatuses, type StatusOption, type LossReasonOption } from '../contexts/StatusContext';