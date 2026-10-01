/* EasternNova Portfolio
   Background Module */

/**
 * Initializes the portfolio background.
 *
 * Phase 2:
 * - Provides the background foundation.
 * - No visual effects yet.
 *
 * Phase 3:
 * - Subtle responsive background.
 * - Scroll response.
 * - Reduced-motion support.
 */

export function initializeBackground() {
    const background =
        document.querySelector("#background");

    if (!background) {
        return;
    }

    background.setAttribute(
        "aria-hidden",
        "true"
    );

    /*
     * Background effects intentionally remain
     * disabled during Phase 2.
     *
     * This keeps the visual system stable while
     * the portfolio structure is being built.
     */
}