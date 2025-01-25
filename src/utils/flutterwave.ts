// Function to close the payment modal
export const closePaymentModal = () => {
  const modal = document.querySelector('iframe');
  if (modal) {
    modal.remove();
  }

  // Also try to remove any overlay/backdrop
  const overlay = document.querySelector('[class*="flw-overlay"]');
  if (overlay) {
    overlay.remove();
  }
};
