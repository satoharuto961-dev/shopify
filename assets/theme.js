(function () {
  function resolveQuantity(element) {
    const quantityAttr = element.getAttribute('data-checkout-quantity');
    const parsedQuantity = Number.parseInt(quantityAttr || '', 10);
    return Number.isNaN(parsedQuantity) || parsedQuantity <= 0 ? 1 : parsedQuantity;
  }

  function resolveVariantId(element) {
    const rawId = element.getAttribute('data-checkout-variant');
    if (!rawId) {
      return null;
    }

    const numericId = Number.parseInt(rawId, 10);
    return Number.isNaN(numericId) ? rawId : numericId;
  }

  function markAsLoading(element, loadingText) {
    element.dataset.checkoutOriginalMarkup = element.innerHTML;
    if (loadingText) {
      element.textContent = loadingText;
    }
    element.classList.add('is-loading');
    element.setAttribute('aria-disabled', 'true');
  }

  function clearLoadingState(element) {
    element.classList.remove('is-loading');
    element.removeAttribute('aria-disabled');
    element.dataset.checkoutProcessing = 'false';

    if (element.dataset.checkoutOriginalMarkup) {
      element.innerHTML = element.dataset.checkoutOriginalMarkup;
      delete element.dataset.checkoutOriginalMarkup;
    }
  }

  async function handleCheckoutClick(event) {
    const trigger = event.currentTarget;
    const variantId = resolveVariantId(trigger);

    if (!variantId || trigger.dataset.checkoutProcessing === 'true') {
      return;
    }

    event.preventDefault();

    const redirectUrl = trigger.getAttribute('data-checkout-redirect') || '/checkout';
    const fallbackUrl = trigger.getAttribute('href') || redirectUrl;
    const loadingText = trigger.getAttribute('data-checkout-loading-text');
    trigger.dataset.checkoutProcessing = 'true';
    markAsLoading(trigger, loadingText);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: resolveQuantity(trigger)
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Unable to start checkout from homepage', error);
      clearLoadingState(trigger);
      window.location.href = fallbackUrl;
    }
  }

  function bindCheckoutButtons() {
    const checkoutButtons = document.querySelectorAll('[data-checkout-variant]');
    checkoutButtons.forEach((button) => {
      button.addEventListener('click', handleCheckoutClick);
    });
  }

  function toggleStickyAvailability(button, isAvailable) {
    if (!button) {
      return;
    }

    if (isAvailable) {
      button.classList.remove('is-disabled');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('tabindex');
      return;
    }

    button.classList.add('is-disabled');
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('tabindex', '-1');
  }

  function updateStickyPriceDisplay(selectedOption) {
    const priceDisplay = document.querySelector('.sticky-buy-now__price-current');
    const compareDisplay = document.querySelector('.sticky-buy-now__price-compare');
    const priceText = selectedOption?.dataset.price;
    const compareText = selectedOption?.dataset.compareAtPrice;

    if (priceDisplay && priceText) {
      priceDisplay.textContent = priceText;
    }

    if (!compareDisplay) {
      return;
    }

    const shouldShowCompare = compareText && compareText.trim() !== '' && compareText !== priceText;
    if (shouldShowCompare) {
      compareDisplay.textContent = compareText;
      compareDisplay.removeAttribute('hidden');
    } else {
      compareDisplay.setAttribute('hidden', 'hidden');
    }
  }

  function handleVariantSelection(event) {
    const variantSelect = event?.target;
    const stickyButton = document.querySelector('.sticky-buy-now__button');

    if (!variantSelect || !stickyButton) {
      return;
    }

    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    const selectedVariantId = variantSelect.value;

    if (selectedVariantId) {
      stickyButton.setAttribute('data-checkout-variant', selectedVariantId);
    }

    const isAvailable = selectedOption ? selectedOption.dataset.available !== 'false' : true;
    toggleStickyAvailability(stickyButton, isAvailable);
    updateStickyPriceDisplay(selectedOption);
  }

  function bindVariantListeners() {
    const variantSelect = document.querySelector('.product-form__select');

    if (!variantSelect) {
      return;
    }

    variantSelect.addEventListener('change', handleVariantSelection);
    handleVariantSelection({ target: variantSelect });
  }

  function initializeTheme() {
    bindCheckoutButtons();
    bindVariantListeners();
  }

  document.addEventListener('DOMContentLoaded', initializeTheme);
})();
