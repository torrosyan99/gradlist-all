import Swiper from 'swiper';
import {Navigation} from "swiper/modules";

export function initHomePage(){


  new Swiper('.top__swiper', {
    slidesPerView: 'auto',
    spaceBetween: 15,
    modules: [Navigation],
    navigation: {
      nextEl: '.top__next',
      prevEl: '.top__prev',
    },
    on: {
      slideChange: function () {
        const prevBtn = document.querySelector('.top__prev')

        if (this.activeIndex > 0) {
          prevBtn.classList.add('top__prev--active')
        } else {
          prevBtn.classList.remove('top__prev--active')
        }
      }
    }
  })

  new Swiper('.top__mobile-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 10,
  })

  const container = document.querySelector('.listings__cards')
  if (container) {
    const items = Array.from(container.querySelectorAll('.listings__card'))

    const BATCH_SIZE = 16
    let currentIndex = 0
    let isLoading = false

    const sourceItems = items.slice(0, BATCH_SIZE)

    function loadMore() {
      if (isLoading) return
      isLoading = true

      const fragment = document.createDocumentFragment()

      for (let i = 0; i < BATCH_SIZE; i++) {
        const item = sourceItems[i % sourceItems.length].cloneNode(true)
        fragment.appendChild(item)
      }

      container.appendChild(fragment)

      isLoading = false
    }

    function handleScroll() {
      const scrollBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200

      if (scrollBottom) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
  }
}