import Browser from '../../../utils/browser';

export default function (index = 0, speed = this.params.speed, runCallbacks = true, internal) {
  const swiper = this;
  let slideIndex = index;
  if (slideIndex < 0) slideIndex = 0;

  const { params, snapGrid, slidesGrid, previousIndex, activeIndex, rtl, $wrapperEl } = swiper;

  swiper.snapIndex = Math.floor(slideIndex / params.slidesPerGroup);
  if (swiper.snapIndex >= snapGrid.length) swiper.snapIndex = snapGrid.length - 1;

  if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
    swiper.emit('beforeSlideChangeStart');
  }

  const translate = -snapGrid[swiper.snapIndex];
  /*
  // Stop autoplay
  if (s.params.autoplay && s.autoplaying) {
    if (internal || !s.params.autoplayDisableOnInteraction) {
      s.pauseAutoplay(speed);
    } else {
      s.stopAutoplay();
    }
  }
  */
  // Update progress
  swiper.updateProgress(translate);
  // Normalize slideIndex
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      if (-Math.floor(translate * 100) >= Math.floor(slidesGrid[i] * 100)) {
        slideIndex = i;
      }
    }
  }

  // Directions locks
  if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
    return false;
  }
  if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
    if ((swiper.activeIndex || 0) !== slideIndex) return false;
  }

  // Update Index
  swiper.previousIndex = activeIndex || 0;
  swiper.activeIndex = slideIndex;
  swiper.updateRealIndex();
  if ((rtl && -translate === swiper.translate) || (!rtl && translate === swiper.translate)) {
    // Update Height
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== 'slide') {
      swiper.setTranslate(translate);
    }
    return false;
  }
  swiper.updateSlidesClasses();
  swiper.transitionStart(runCallbacks);

  if (speed === 0 || Browser.lteIE9) {
    swiper.setTranslate(translate);
    swiper.setTransition(0);
    swiper.transitionEnd(runCallbacks);
  } else {
    swiper.setTranslate(translate);
    swiper.setTransition(speed);
    if (!swiper.animating) {
      swiper.animating = true;
      $wrapperEl.transitionEnd(() => {
        if (!swiper) return;
        swiper.transitionEnd(runCallbacks);
      });
    }
  }

  return true;
}