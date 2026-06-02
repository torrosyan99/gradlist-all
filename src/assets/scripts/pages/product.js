import Swiper from "swiper";
import {Navigation, Thumbs} from "swiper/modules";

export function initProductPage() {
  const swiper = new Swiper(".product__swiper", {
    spaceBetween: 15.5,
    slidesPerView: 'auto',
    freeMode: true,
    watchSlidesProgress: true,
  });

  if (swiper) {
    new Swiper(".product__main-swiper", {
      loop: true,
      spaceBetween: 10,
      slidesPerView: 1.25,
      modules: [Navigation, Thumbs],
      breakpoints: {
        768: {
          slidesPerView: 1,
        }
      },
      navigation: {
        nextEl: ".product__slider-next",
        prevEl: ".product__slider-prev",
      },
      thumbs: {
        swiper: swiper,
      },
    });
  }

  new Swiper('.product__cards-swiper', {
    spaceBetween: 15,
    slidesPerView: 1.25,
    breakpoints: {
      768: {
        slidesPerView: 3,
      }
    }
  })
}