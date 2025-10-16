<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <div class="root" style='font-family: Epilogue, "Noto Sans", sans-serif;'>
      <div class="container">
        <!-- header 开始 -->
        <header class="header">
           <!-- 导航栏开始 -->
          <div class="nav">
            <!-- 导航左侧logo -->
            <div class="nav-logo">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_6_543)">
                  <path
                    d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                    fill="currentColor"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_543"><rect width="48" height="48" fill="white"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 class="text-[#111811] text-lg font-bold leading-tight tracking-[-0.015em]">果蔬商城</h2>
          </div>
         
          <!-- 导航栏右侧 -->
          <div class="nav-right">
            <div class="nav-right-items">
              <a class="text-[#111811] text-sm font-medium leading-normal" href="#">首页</a>
              <a class="text-[#111811] text-sm font-medium leading-normal" href="#">所有产品</a>
              <a class="text-[#111811] text-sm font-medium leading-normal" href="#">新品</a>
              <a class="text-[#111811] text-sm font-medium leading-normal" href="#">促销</a>
              <a class="text-[#111811] text-sm font-medium leading-normal" href="#">联系我们</a>
            </div>
            <!-- 搜索框 购物车 -->
            <div class="nav-right-btns">
              <!-- 搜索框 -->
              <button
                class="nav-right-search-item"
              >
                <div class="search" data-icon="MagnifyingGlass" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                    ></path>
                  </svg>
                </div>
              </button>
              <!-- 购物车 -->
              <button
                class="nav-right-cart"
              >
                <div class="nav-right-cart-item" data-icon="ShoppingCart" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
           <!-- 导航栏右侧结束 -->
        </header>
        <!-- header 结束 -->

        <!-- 内容开始 -->
        <div class="main">
          <div class="main-content">
            <!-- 轮播图开始 -->
            <div class="@container">
              <div class="banner">
                <div
                  class="banner-image"
                  style='background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDs52H2WC3vppxmZ2Olu2iZm9jXQpfNf_pPrWZi3Ha01ibTtmZoYP_mUlI9LH3FCgWhvT_ExIRPEc41gmwDCMxDqAG6o2WCJ68DpLQ2ieaNpEObtTxc9bGA02xLDuLkYhWa_hcRmBl_7aiPrgPbPCIIrhBEGQlVOYibC9qjhY6Pw-45XbYG1ZI12lv32cC0ZttEJ3-IzBEjL--iY8zrzXmb1JWxXuNsqwmYWYnctDX_NeO8ey5vqTFMrH250ZNt-QP0k2ghBLFj24ZS");'
                >
                <!-- 小圆点 -->
                  <div class="banner-icons">
                    <div class="size-1.5 rounded-full bg-white"></div>
                    <div class="size-1.5 rounded-full bg-white opacity-50"></div>
                    <div class="size-1.5 rounded-full bg-white opacity-50"></div>
                    <div class="size-1.5 rounded-full bg-white opacity-50"></div>
                    <div class="size-1.5 rounded-full bg-white opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 轮播图结束 -->

            <!-- 分类开始 -->
            <div class="bar">
              <div class="bar-item">
                <a class="bar-items" href="#">
                  <div class="text-[#111811]" data-icon="Command" data-size="24px" data-weight="fill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M100,86.38V100H86.38A14.25,14.25,0,0,1,72,87,14,14,0,0,1,87,72,14.25,14.25,0,0,1,100,86.38ZM72,169a14,14,0,0,0,15,15,14.25,14.25,0,0,0,13-14.34V156H86.38A14.25,14.25,0,0,0,72,169ZM184,87a14,14,0,0,0-15-15,14.25,14.25,0,0,0-13,14.34V100h13.62A14.25,14.25,0,0,0,184,87Zm40-23V192a32,32,0,0,1-32,32H64a32,32,0,0,1-32-32V64A32,32,0,0,1,64,32H192A32,32,0,0,1,224,64Zm-68,76V116h13.38c16.39,0,30.21-12.88,30.61-29.25A30,30,0,0,0,169.25,56C152.88,56.41,140,70.23,140,86.62V100H116V86.62C116,70.23,103.12,56.41,86.75,56A30,30,0,0,0,56,86.75C56.41,103.12,70.23,116,86.62,116H100v24H86.62C70.23,140,56.41,152.88,56,169.25A30,30,0,0,0,86.75,200c16.37-.4,29.25-14.22,29.25-30.61V156h24v13.38c0,16.39,12.88,30.21,29.25,30.61A30,30,0,0,0,200,169.25c-.4-16.37-14.22-29.25-30.61-29.25Zm-40,0h24V116H116Zm40,30a14,14,0,1,0,14-14H156Z"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-[#111811] text-sm font-bold leading-normal tracking-[0.015em]">时令水果</p>
                </a>
                <a class="bar-items" href="#">
                  <div class="text-[#618961]" data-icon="Carrot" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M232,64H203.31l26.35-26.34a8,8,0,0,0-11.32-11.32L192,52.69V24a8,8,0,0,0-16,0V56.57a64,64,0,0,0-77.2,10.12l0,0,0,0,0,0c-40.1,39.39-70.25,133.08-73.19,142.45a16,16,0,0,0,21.26,21.26c9.37-2.94,103.18-33.13,142.47-73.21A64,64,0,0,0,199.43,80H232a8,8,0,0,0,0-16Zm-54.12,82c-8.94,9.12-21.25,17.8-34.85,25.73l-25.38-25.39a8,8,0,0,0-11.32,11.32l22.09,22.09c-40.87,21.19-86.32,35.42-87,35.63A7.93,7.93,0,0,0,40,216a7.93,7.93,0,0,0,.59-1.41c.29-.93,28-89.58,64-130.67l33.77,33.77a8,8,0,0,0,11.32-11.32L116.18,72.88A48,48,0,0,1,177.88,146Z"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-[#618961] text-sm font-bold leading-normal tracking-[0.015em]">新鲜蔬菜</p>
                </a>
                <a class="bar-items" href="#">
                  <div class="text-[#618961]" data-icon="OrangeSlice" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M248,80H8a8,8,0,0,0-8,8,128,128,0,0,0,256,0A8,8,0,0,0,248,80ZM77.4,149.91l42.6-42.6V167.6A79.59,79.59,0,0,1,77.4,149.91ZM66.09,138.6A79.59,79.59,0,0,1,48.4,96h60.29ZM136,107.31l42.6,42.6A79.59,79.59,0,0,1,136,167.6Zm53.91,31.29L147.31,96H207.6A79.59,79.59,0,0,1,189.91,138.6ZM128,200A112.15,112.15,0,0,1,16.28,96H32.34a96,96,0,0,0,191.32,0h16.06A112.15,112.15,0,0,1,128,200Z"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-[#618961] text-sm font-bold leading-normal tracking-[0.015em]">健康果汁</p>
                </a>
                <a class="bar-items" href="#">
                  <div class="text-[#618961]" data-icon="Leaf" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-[#618961] text-sm font-bold leading-normal tracking-[0.015em]">有机蔬菜</p>
                </a>
              </div>
            </div>
            <!-- 分类结束 -->

            <!-- 商品列表开始 -->
            <h2 class="title">热门精选</h2>
            <div class="product">
              <div class="product-list">
                <div class="product-list-item">
                  <div
                    class="product-list-item-img"
                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAM1Qcj3rdveXe6aEn1JsxAwKspi6gIKnW5ZkegTXrAqBsI3OSha5NEyb5kiOS5dX7X2jB_rWYqzH80o-TZq2yu32NjlS9dBSkosI8fgnm9sK26tJZy5fq-bG4CstlTHCDWwAYJdJblk5y6HU4-UJWLSWFpGKxOzTmWxm_EVTE1OFNEWLLgL7kH9mdFF38NMESQtj2dZdr6g6B0j9ohxXomJauOE2rri1_TUHvI1OuyQb96BLHFKng15D_L_YTUU9-fqtKMsF5q2HUL");'
                  ></div>
                  <div>
                    <!-- 商品名称 -->
                    <p class="text-[#111811] text-base font-medium leading-normal">脆苹果</p>
                    <!-- 价格 -->
                    <p class="text-[#618961] text-sm font-normal leading-normal">￥2.99 /斤</p>
                  </div>
                </div>
                <div class="product-list-item">
                  <div
                    class="product-list-item-img"
                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAOipsFkxqypFsIhRZGtIm0k9PORn3nrG1XEDTLUvHnbk47zTv_lMw-EkR4Mt9WYTg770eJbX0tNuUFPZaoyFel_2YgMY7wqvjRb8qKtDBl1uB0S1Txh7FQ3qL7ATTbSjdeTe4Wm7iEJxLZGlXI9zxvh-AD545N6GEuWJOqJx54oksAvk5F8xlX0JMa3MdCU3DN0iPBPMEgRi5vXdcLl6VoXfqCYhi_uCtGMzHZWYt4zmJKjAdMV4Dv3ohdvZ14NTLRY51z2UzVIJWr");'
                  ></div>
                  <div>
                    <p class="text-[#111811] text-base font-medium leading-normal">Vine-Ripened Tomatoes</p>
                    <p class="text-[#618961] text-sm font-normal leading-normal">$1.49/lb</p>
                  </div>
                </div>
                <div class="product-list-item">
                  <div
                    class="product-list-item-img"
                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJ3oNGFzWY3KGId1P2Y9qVJgByRylDXpnC-OhmkspkHq-MiiDPFYxSo-pc1ddn0Av1HzfBzrStTPCscu7WRRHVA2XofrasoXHg0Sq8YygmQwJa1rb-Amo0_4CCzVD4y3dBsZ72dxbOxOnVXTDnDBDJi60RUJ7s6OB1CWcca_WOOtADC3gpVMT1xJzhdMpGfRGvvPezndf0nkQX41s61SLsoK9RSwyrjpsBMv_JImJUMbCJ4ssvoCFFnA1eV4a_ySF1C05wLnMfA4KB");'
                  ></div>
                  <div>
                    <p class="text-[#111811] text-base font-medium leading-normal">Organic Spinach</p>
                    <p class="text-[#618961] text-sm font-normal leading-normal">$3.49/bunch</p>
                  </div>
                </div>
                <div class="product-list-item">
                  <div
                    class="product-list-item-img"
                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjR4m2w7eIouvYkHVZzHlA6lE1CuCVsSQ-fLklzMuJlReJEYeTIhuPhWcr97q3wxQqGz4QXNgmGoLPDQ8qF8WnoNyh6MfrgkUEQD8ZxTAXNVhbt5pfDW3zVm0FZnU-8N3ermUvrvPJ0Lm_kv806qdxCi55FDaW83YJfzDaCwZKVbelgOkIUW_G8iZ5NWSiZxwG1ZPly4TrMHFBzZ8DLEwofXKvVwuJmXXqabeSkjplj18W_QIPmrUJZWUPVmoQtjInN2vonVzYRVF_");'
                  ></div>
                  <div>
                    <p class="text-[#111811] text-base font-medium leading-normal">Freshly Squeezed Orange Juice</p>
                    <p class="text-[#618961] text-sm font-normal leading-normal">$4.99/bottle</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- 商品列表结束 -->

            <!-- 客户评价开始 -->
            <h2 class="comment">Customer Reviews</h2>
            <div class="comment-list">
              <div class="comment-list-item">
                <div class="comment-list-item-user">
                  <div
                    class="comment-list-item-user-avatar"
                    style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCtSvxyPWUqDFdhmbUZX8W36BOFallK6Cq2TI9MBwahVmnKREbplcnVT2QNM1FJAjLUfbaZaXuTwb-dX4EhlhmqabESBXt8qp2nYleJQFxd6vzgLbVfgb1Ihhfh8e3RTLsgQuSUtTupWPpBkuKu_PDvIO6xKt6eqVtAifG9h1T8WuN_XeWSaIwY0zgcxEfpf3XpC9rqJJc_2sIGGmw5vuzlS_Hg5ftZQ1A3S5H4loGUxcd7jQuT7juf_ch2TAHU8yU3oSLMla-rciJS");'
                  ></div>
                  <div class="comment-list-item-user-info">
                    <p class="comment-list-item-user-info-name">伊桑·贝内特</p>
                    <p class="comment-list-item-user-info-date">2024年5月10日</p>
                  </div>
                </div>
                <!-- 五星评价 -->
                <div class="comment-list-item-star">
                  <div class="comment-list-item-star-item" data-icon="Star" data-size="20px" data-weight="fill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                      ></path>
                    </svg>
                  </div>
                  <div class="comment-list-item-star-item" data-icon="Star" data-size="20px" data-weight="fill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                      ></path>
                    </svg>
                  </div>
                  <div class="comment-list-item-star-item" data-icon="Star" data-size="20px" data-weight="fill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                      ></path>
                    </svg>
                  </div>
                  <div class="comment-list-item-star-item" data-icon="Star" data-size="20px" data-weight="fill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                      ></path>
                    </svg>
                  </div>
                  <div class="comment-list-item-star-item" data-icon="Star" data-size="20px" data-weight="fill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <!-- 评论内容 -->
                <p class="comment-list-item-content">">番茄新鲜美味，非常适合做沙拉。价格有点小贵，但物有所值。</p>
                <div class="comment-list-item-like">
                  <!-- 点赞 -->
                  <button class="comment-list-item-likes">
                    <div class="text-inherit" data-icon="ThumbsUp" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"
                        ></path>
                      </svg>
                    </div>
                    <p class="text-inherit">3</p>
                  </button>
                  <!-- 踩 -->
                  <button class="comment-list-item-stepon">
                    <div class="text-inherit" data-icon="ThumbsDown" data-size="20px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <!-- 客户评价结束 -->

            <!-- 故事 -->
            <h2 class="story-title">Our Story</h2>
            <p class="story">
              在 Fresh Harvest，我们致力于将最新鲜、最优质的农产品直接从本地农场送到您的餐桌。我们的旅程始于一个简单的想法：将消费者与食物来源联系起来，确保新鲜度和可持续性。我们与同样热衷于品质和环境责任的农民紧密合作，采用可持续的耕作方式种植最好的水果和蔬菜。我们的产品涵盖各种时令农产品，从爽脆的苹果和多汁的浆果，到鲜嫩的绿叶蔬菜和营养丰富的根茎类蔬菜。每件产品都经过精心挑选和处理，以保持其新鲜度和营养价值，确保您收到最好的产品。我们推崇透明度和可追溯性，因此您可以随时了解食物的来源和种植方式。我们的承诺不仅仅是提供优质的农产品；我们还致力于教育顾客了解健康饮食和可持续生活的好处。加入我们，支持本地农业，享受最新鲜、最美味的农产品。
            </p>
          </div>
            <!-- 商品评论结束 -->
        </div>
        <!-- 内容区结束 -->

        <!-- 底部开始 -->
        <footer class="footer">
          <div class="footer-container">
            <footer class="footer-content @container">
              <div class="footer-content-links">
                <a class="text-[#618961] text-base font-normal leading-normal min-w-40" href="#">关于我们</a>
                <a class="text-[#618961] text-base font-normal leading-normal min-w-40" href="#">隐私政策</a>
                <a class="text-[#618961] text-base font-normal leading-normal min-w-40" href="#">服务条款</a>
                <a class="text-[#618961] text-base font-normal leading-normal min-w-40" href="#">常见问题</a>
              </div>
              <p class="copyright">© 2024 Fresh Harvest. 保留所有权利。</p>
            </footer>
          </div>
        </footer>
        <!-- 底部结束 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'

const productStore = useProductStore()
const popularProducts = ref([])

const categories = [
  { id: 1, name: 'Seasonal Fruits', icon: '🍎' },
  { id: 2, name: 'Fresh Vegetables', icon: '🥬' },
  { id: 3, name: 'Healthy Juices', icon: '🥤' },
  { id: 4, name: 'Organic Greens', icon: '🌿' }
]

const reviews = [
  { id: 1, username: 'Sophia Carter', date: 'May 15, 2024', comment: 'The apples were incredibly crisp and sweet, perfect for snacking!' },
  { id: 2, username: 'Ethan Bennett', date: 'May 10, 2024', comment: 'The tomatoes were fresh and flavorful, great for salads.' }
]

onMounted(async () => {
  await productStore.fetchProducts()
  popularProducts.value = productStore.products.slice(0, 4)
})


</script>

<style scoped >
.home {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
  min-height: 100vh;
}
</style>