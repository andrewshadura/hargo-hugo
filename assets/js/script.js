// Preloader js    
$(window).on('load', function () {
  $('.preloader').fadeOut(100);
});

(function ($) {
  'use strict';

  // navigation
  $(window).scroll(function () {
    if ($('.navigation').offset().top > 1) {
      $('.navigation').addClass('nav-bg');
    } else {
      $('.navigation').removeClass('nav-bg');
    }
  });


  // video modal popup
  var $videoSrc;
  $('.video-modal').click(function () {
    $videoSrc = $(this).data("src");
  });
  $('#videoModal').on('shown.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  })
  $('#videoModal').on('hide.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc);
  })
  $('#videoModal2').on('shown.bs.modal', function (e) {
    $("#video2").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  })
  $('#videoModal2').on('hide.bs.modal', function (e) {
    $("#video2").attr('src', $videoSrc);
  })


  // testimonial slider
  $('.testimonial-slider').slick({
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '<button type=\'button\' class=\'prevArrow\'><i class=\'ti-arrow-left\'></i></button>',
    nextArrow: '<button type=\'button\' class=\'nextArrow\'><i class=\'ti-arrow-right\'></i></button>',
    autoplay: true,
    responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 401,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });


  // product Slider
  $('.product-slider').slick({
    autoplay: false,
    infinite: false,
    arrows: false,
    dots: true,
    customPaging: function (slider, i) {
      var image = $(slider.$slides[i]).data('image');
      return '<img class="img-fluid" src="' + image + '">';
    }
  });

  function recalculatePrice(e) {
    if (e && e.target.tagName.toLowerCase() == 'select') {
      const target = e.target.children[e.target.selectedIndex]
      if (target.dataset.includes) {
        const includes = JSON.parse(target.dataset.includes)
        for (const option in includes) {
          const selectedOption = $(`#${option}-select [value="${includes[option]}"]`)
          if (selectedOption.length) {
            selectedOption[0].selected = true
          }
        }
      }
    }

    let base_price = Math.round(parseFloat($(".p-price").attr("content")) * 100)

    let image = null
    let image2 = null

    let options = normaliseSelectedOptions(collectAllOptions())
    console.log(options)

    if ($.isEmptyObject(options)) {
      return
    }

    let variant = null

    let extras = $(".product-option :selected").map(function() {
      if (this.dataset.variant) {
        variant = this.dataset.variant
      }

      if (this.dataset.image) {
        image = this.dataset.image
      }

      if (this.dataset.image2) {
        image2 = this.dataset.image2
      }

      return options[this.dataset.name][this.value].price
      //return (parseFloat(this.dataset.price) * 100) | 0
    }).get().reduce((total, x) => total + x, 0)

    if (variant) {
      $(".p-variant-name").text(variant)
    }

    const image_candidates = prepareImageCandidates()
    if (!image) {
      // TODO: try next candidates too
      if ((colour_images || []) && (colour_images.indexOf(image_candidates[0][0]) >= 0)) {
        image = image_candidates[0][0]
      }
    }
    if (!image2) {
      if ((colour_images || []) && (colour_images.indexOf(image_candidates[0][1]) >= 0)) {
        image2 = image_candidates[0][1]
      }
    }

    if (image) {
        $(".product-slider .slick-track .slick-slide:first-child").attr("data-remote", image)
        $(".product-slider .slick-track .slick-slide:first-child > img").attr("src", image)
        $(".product-slider ul.slick-dots li:first-child > img").attr("src", image)
    } else {
        const orig_image = $(".product-slider .slick-track .slick-slide:first-child").data("image")
        $(".product-slider .slick-track .slick-slide:first-child").attr("data-remote", orig_image)
        $(".product-slider .slick-track .slick-slide:first-child > img").attr("src", orig_image)
        $(".product-slider ul.slick-dots li:first-child > img").attr("src", orig_image)
    }

    if (image2) {
        $(".product-slider .slick-track .slick-slide:nth-child(2)").attr("data-remote", image2)
        $(".product-slider .slick-track .slick-slide:nth-child(2) > img").attr("src", image2)
        $(".product-slider ul.slick-dots li:nth-child(2) > img").attr("src", image2)
    } else {
        const orig_image = $(".product-slider .slick-track .slick-slide:nth-child(2)").data("image")
        $(".product-slider .slick-track .slick-slide:nth-child(2)").attr("data-remote", orig_image)
        $(".product-slider .slick-track .slick-slide:nth-child(2) > img").attr("src", orig_image)
        $(".product-slider ul.slick-dots li:nth-child(2) > img").attr("src", orig_image)
    }

    let price = base_price + extras

    $(".p-price").text(Cart.currencyFormat.format(price / 100))
    collectOptions()
  }

  function collectOptionArgs(arg) {
    return Object.fromEntries($(".product-option :selected, .product-option :checked").get().map(function(e) {
      return [e.dataset.name || e.name, e.dataset[arg]]
    }))
  }

  function collectOptions() {
    return $(".product-option :selected, .product-option :checked").map(function() {
      let scratch = {}
      scratch[this.dataset.name || this.name] = this.value
      return scratch
    }).get().reduce((total, x) => Object.assign(total, x), {})
  }

  function collectSelectedOptions() {
    return $(".product-option :selected, .product-option :checked").map(function() {
      let scratch = {}
      const name = this.dataset.name || this.name
      scratch[name] = Object.assign({}, this.dataset)
      if (this.dataset.price) {
        scratch[name].price = (parseFloat(this.dataset.price) * 100) | 0
      }
      if (this.dataset.includes) {
        scratch[name].includes = JSON.parse(this.dataset.includes)
      }
      scratch[name].value = this.value
      return scratch
    }).get().reduce((total, x) => Object.assign(total, x), {})
  }

  function collectAllOptions() {
    let scratch = {}
    for (const option of $(".product-option.product-option-radio, .product-option option")) {
      const name = option.dataset.name || option.name
      scratch[name] ||= {}
      scratch[name][option.value] = Object.assign({}, option.dataset)
      if (option.dataset.price) {
        scratch[name][option.value].price = (parseFloat(option.dataset.price) * 100) | 0
      }
      if (option.dataset.includes) {
        scratch[name][option.value].includes = JSON.parse(option.dataset.includes)
      }
      scratch[name][option.value].value = option.value
    }
    return scratch
  }

  function normaliseSelectedOptions(options) {
    const selectedOptions = collectSelectedOptions()
    for (const selected in selectedOptions) {
      const value = selectedOptions[selected].value
      const option = options[selected][value]
      if (option.includes) {
        for (const i in option.includes) {
          const selectedInclude = option.includes[i]
          const selectedIncludePrice = options[i][selectedInclude].price
          console.log(`decreasing prices of ${i} by ${selectedIncludePrice/100} as ${selectedInclude} included in ${selected} ${value}`)
          for (const o in options[i]) {
            const price = options[i][o].price - selectedIncludePrice
            const priceText = Cart.currencyFormat.format(Math.abs(price / 100))
            const priceSign = (price > 0) ? '+' : '−'
            const label = (price == 0) ? options[i][o].label : `${options[i][o].label} (${priceSign}${priceText})`
            options[i][o].price = price
            const urlized = i.replaceAll(" ", "-")
            $(`#${urlized}-select [value="${options[i][o].value}"]`).text(label)
          }
        }
      }
    }
    return options
  }

  window.collectSelectedOptions = collectSelectedOptions
  window.collectAllOptions = collectAllOptions
  window.normaliseSelectedOptions = normaliseSelectedOptions

  function prepareImageCandidates() {
    let image_candidates = []
    let image_fallback = []

    const orig_image = $(".product-slider .slick-track .slick-slide:first-child").data("image")
    const orig_image2 = $(".product-slider .slick-track .slick-slide:nth-child(2)").data("image")

    let selectedColours = $(".color-button.product-option:checked")
    if (selectedColours.length) {
      const colour_id = selectedColours[0].id.replace("colour-", "")

      let colour_prefixes = Object.values(collectOptionArgs("colourPrefix")).filter((x) => x)
      colour_prefixes.push('')

      for (const i in colour_prefixes) {
        const path = colour_prefixes.slice(i).join('')
        image_candidates.push(
          [
            window.location.pathname.replace(/\/$/, '') + "/colours/" + path + colour_id + ".jpg",
            window.location.pathname.replace(/\/$/, '') + "/colours/" + path + colour_id + "_2.jpg"
          ]
        )
      }
    }
    image_candidates.push(
      [
        orig_image,
        orig_image2
      ]
    )

    return image_candidates
  }

  function updateColour() {
    console.error("unused code called")
    return

    let selectedColours = $(".color-button.product-option:checked")
    if (selectedColours.length) {
      const colour = selectedColours[0]
      const colour_id = colour.id.replace("colour-", "")
      let image = window.location.pathname + "/colours/" + colour_id + ".jpg"

      let http = new XMLHttpRequest()
      http.open('HEAD', image)
      http.onreadystatechange = function() {
        if (
          (this.readyState == this.DONE) &&
          (this.status != 404)
        ) {
          $(".product-slider .slick-track .slick-slide:first-child").attr("data-remote", image)
          $(".product-slider .slick-track .slick-slide:first-child > img").attr("src", image)
          $(".product-slider ul.slick-dots li:first-child > img").attr("src", image)
        }
      }
      http.send()

      let image2 = window.location.pathname + "/colours/" + colour_id + "_2.jpg"
      http = new XMLHttpRequest()
      http.open('HEAD', image2)
      http.onreadystatechange = function() {
        if (
          (this.readyState == this.DONE) &&
          (this.status != 404)
        ) {
          $(".product-slider .slick-track .slick-slide:nth-child(2)").attr("data-remote", image2)
          $(".product-slider .slick-track .slick-slide:nth-child(2) > img").attr("src", image2)
          $(".product-slider ul.slick-dots li:nth-child(2) > img").attr("src", image2)
        }
      }
      http.send()

      return colour_id
    } else {
      return false
    }
  }

  $('.product-option').on('change', recalculatePrice);

  (function(){
    const params = new URLSearchParams(window.location.search)
    const colour = params.get("colour")
    if (colour) {
      const colour_button = $("#colour-" + colour)[0]
      if (colour_button) {
        colour_button.checked = true
      }
    }
    let options = collectAllOptions()
    delete options.colour

    for (const option in options) {
      const urlized = option.replaceAll(" ", "-")
      const value = params.get(urlized)
      if (value) {
        const selectedOption = $(`#${urlized}-select [value="${value}"], #${urlized}-select [data-variant="${value}"], #${urlized}-select [data-option-id="${value}"]`)
        if (selectedOption.length) {
          selectedOption[0].selected = true
        }
      }
    }
  })()

  recalculatePrice()

  $('.contact-modal').on('shown.bs.modal', function (e) {
    const size = $(".product-option :selected")
    const options = collectOptions()
    console.log(options)
    $('.contact-modal form [name="item-size"]').val(options.size)
    $('.contact-modal form [name="item-options"]').val(JSON.stringify(options))
  })

  $('.btn-group .btn input[type="radio"]:checked').each(function(i, el) {
    el.labels[0].classList.add('active')
  })


  // Accordions
  $('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
  }).on('hidden.bs.collapse', function () {
    $(this).parent().find('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
  });

  $('[data-toggle="tooltip"]').tooltip();

  $(document).on('click', '[data-toggle="lightbox"]', function(event) {
                event.preventDefault();
                $(this).ekkoLightbox({
                    alwaysShowClose: true,
                });
            })

})(jQuery);
