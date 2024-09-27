<template>
    <header :class="['header', { scrolled: isScrolled || isNavHidden }]">
        <div class="header-content" :style="headerContentStyle">
            <div class="content">
                <div
                    class="logo"
                    :class="{ 'logo-move-down': isNavHidden, 'logo-move-up': !isNavHidden && wasNavHidden }"
                >
                    나 님
                </div>

                <div class="search-container">
                    <input
                        v-if="isSearchVisible"
                        type="text"
                        class="search-input"
                        placeholder="검색"
                        v-model="searchQuery"
                        @blur="toggleSearch"
                    />
                    <i class="search-icon" @click="toggleSearch">
                        <!-- <img src="https://i.ibb.co/W34yBxW/search24px.png" alt="searchIcon" /> -->
                        <svg
                            v-if="!isScrolled"
                            class="svg-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="36"
                            height="36"
                            viewBox="0 0 64 64"
                        >
                            <path
                                d="M 27 9 C 17.075 9 9 17.075 9 27 C 9 36.925 17.075 45 27 45 C 31.129213 45 34.9263 43.587367 37.966797 41.240234 L 51.048828 54.322266 C 51.952828 55.226266 53.418266 55.226266 54.322266 54.322266 C 55.226266 53.418266 55.226266 51.952828 54.322266 51.048828 L 41.240234 37.966797 C 43.587367 34.9263 45 31.129213 45 27 C 45 17.075 36.925 9 27 9 z M 27 13 C 34.719 13 41 19.281 41 27 C 41 34.719 34.719 41 27 41 C 19.281 41 13 34.719 13 27 C 13 19.281 19.281 13 27 13 z"
                            ></path>
                        </svg>

                        <svg
                            v-else
                            class="svg-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="36"
                            height="36"
                            viewBox="0 0 64 64"
                        >
                            <path
                                d="M 27 9 C 17.075 9 9 17.075 9 27 C 9 36.925 17.075 45 27 45 C 31.129213 45 34.9263 43.587367 37.966797 41.240234 L 51.048828 54.322266 C 51.952828 55.226266 53.418266 55.226266 54.322266 54.322266 C 55.226266 53.418266 55.226266 51.952828 54.322266 51.048828 L 41.240234 37.966797 C 43.587367 34.9263 45 31.129213 45 27 C 45 17.075 36.925 9 27 9 z M 27 13 C 34.719 13 41 19.281 41 27 C 41 34.719 34.719 41 27 41 C 19.281 41 13 34.719 13 27 C 13 19.281 19.281 13 27 13 z"
                                fill="#ffffff"
                            ></path>
                        </svg>
                    </i>
                </div>
            </div>
            <nav :class="{ scrolled: isScrolled, 'nav-hidden': isNavHidden }">
                <a href="#" class="nav-item">최근 시청 동화</a>
                <a href="#" class="nav-item">동화</a>
                <a href="#" class="nav-item">카테고리 ▽</a>
            </nav>
        </div>
    </header>
</template>

<script>
export default {
    data() {
        return {
            isScrolled: false,
            isNavHidden: false,
            wasNavHidden: false,
            lastScrollPosition: 0,
        };
    },
    computed: {
        headerContentStyle() {
            return {
                padding: this.isScrolled && this.isNavHidden ? '0 30px' : '0 10px',
                transition: 'padding 0.5s ease',
            };
        },
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        handleScroll() {
            const currentScrollPosition = window.scrollY;
            this.isScrolled = currentScrollPosition > 10;

            if (currentScrollPosition < this.lastScrollPosition) {
                if (this.isNavHidden) {
                    this.wasNavHidden = true;
                    setTimeout(() => {
                        this.wasNavHidden = false;
                    }, 500); // 애니메이션 지속 시간과 일치
                }
                this.isNavHidden = false;
            } else {
                this.isNavHidden = currentScrollPosition > 50;
            }

            this.lastScrollPosition = currentScrollPosition;
        },
    },
};
</script>

<style scoped>
.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    padding: 20px;
    flex-direction: column;
    transition: all 0.5s ease;
}

.content {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
}

.header.nav-hidden .header-content {
    justify-content: center;
    align-items: center;
}

.logo {
    font-size: 2rem;
    font-weight: bold;
    padding: 10px 0;
    color: #e50914;
    transition: all 0.5s ease;
}

.logo-move-down {
    animation: logoMoveDown 0.5s ease forwards;
}

.logo-move-up {
    animation: logoMoveUp 0.5s ease forwards;
}

nav {
    display: flex;
    transition: all 0.3s ease;
    transform-origin: top right;
    max-height: 50px;
    padding-bottom: 10px;
    overflow: hidden;
}

.nav-item {
    font-weight: normal;
    color: #000000;
    text-decoration: none;
    margin-right: 10px;
    font-size: 1.2rem;
    padding: 3px 10px;
    transition: all 0.3s ease;
    border: 1px solid #000000;
    border-radius: 15px;
}

.header:not(.scrolled) .nav-item {
    color: #000000;
}

.header.scrolled {
    background-color: rgba(54, 54, 54, 0.8);
    backdrop-filter: blur(10px);
}

.header.scrolled .nav-item {
    color: #ffffff;
    border-color: #ffffff;
}

.header.scrolled .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-hidden {
    opacity: 0;
    transform: translate(50%, -100%) scale(0.5);
    max-height: 0;
}

.header.nav-hidden {
    height: 5vh;
}

@keyframes slideUpRight {
    0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(10%, -150%) scale(0.1);
        opacity: 0;
    }
}

@keyframes slideDownLeft {
    0% {
        transform: translate(10%, -150%) scale(0.1);
        opacity: 0;
    }
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
}

nav:not(.nav-hidden) {
    animation: slideDownLeft 0.4s ease forwards;
}

nav.nav-hidden {
    animation: slideUpRight 0.4s ease forwards;
}

.search-icon {
    display: flex;
}
</style>
