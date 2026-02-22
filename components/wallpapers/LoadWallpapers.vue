<script setup>
import { shuffleArray } from '~/composables/helpers';
import { register } from 'swiper/element/bundle';

// Register Swiper web components
register();

const images = computed(() => {
    const imagesUrls = shuffleArray(Object.values(import.meta.glob('@/assets/wallpapers/*.{png,jpg,jpeg,PNG,JPEG}', { eager: true, query: '?url', import: 'default' })));
    return imagesUrls.map((image) => {
        return {
            preview: new URL(image, import.meta.url),
            template: new URL(image, import.meta.url),
            typeface: "WallpapersDesignsWhiteTextYellowTableDesign"
        }
    });
});

const templateChosen = ref(null);
const swiperRef = ref(null);
const emits = defineEmits(['updateTemplateChosen']);

function chooseTemplate(index) {
    templateChosen.value = images.value[index];
    emits('updateTemplateChosen', templateChosen.value);
}

onMounted(() => {
    nextTick(() => {
        const el = swiperRef.value;
        if (!el) return;

        // Configure and initialize
        Object.assign(el, {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 10,
            loop: true,
            loopedSlides: 3,
            navigation: true,
            pagination: { clickable: true },
            scrollbar: { draggable: true },
        });
        el.initialize();

        // Listen for slide changes
        el.addEventListener('swiperslidechange', (e) => {
            const [swiper] = e.detail;
            chooseTemplate(swiper.realIndex);
        });

        // Set initial template
        const swiper = el.swiper;
        if (swiper) {
            chooseTemplate(swiper.realIndex);
        } else {
            // Fallback: pick first image
            chooseTemplate(0);
        }
    });
});
</script>


<template>
    <div class="template-chooser-container">
        <h1 class="text-2xl font-bold max-w-[410px] text-gray-900 dark:text-white">Choose from the following {{ images.length }} designs:</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm font-light italic">Swipe left or right to change the background.</p>
        <div class="template-images-container rounded-lg">
            <swiper-container ref="swiperRef" class="swiper-cards rounded-lg" init="false">
                <swiper-slide v-for="(image, index) in images" :key="index" class="template-images-div rounded-lg">
                    <img :src="image.preview" :alt="'Image ' + index" />
                </swiper-slide>
            </swiper-container>
        </div>
    </div>
</template>


<style scoped>
.template-chooser-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.template-images-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 20px;
    overflow: hidden;
    cursor: pointer;
}

.template-images-div {
    display: flex;
    object-fit: cover;
    width: auto;
    margin-right: 0.5rem;
}

.template-images-div:last-child {
    margin-right: 0;
}

.template-images-div img {
    display: block;
    width: inherit;
    height: inherit;
}

.swiper-cards {
    width: 100%;
    max-width: 400px;
}

.template-images-div {
    width: 150px !important;
}
</style>

<style>
swiper-container::part(button-prev) {
    left: 0 !important;
    color: var(--color-primary-400);
}

swiper-container::part(button-next) {
    right: 0 !important;
    color: var(--color-primary-400);
}

swiper-container::part(scrollbar) {
    background-color: rgb(209 213 219) !important;
    height: 5px !important;
}

swiper-container::part(pagination) {
    display: none !important;
}
</style>
