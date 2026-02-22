<script setup>
const rootContainer = ref(null);
const windowWidth = ref(0);
const windowHeight = ref(0);
const usingSafari = ref(false);

const colorMode = useColorMode();
const toast = useToast();

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => { colorMode.preference = val ? 'dark' : 'light'; }
});

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  const iOS = !!ua.match(/iP(ad|od|hone)/i);

  // All iOS browsers use WebKit engine, so always use html2canvas on iOS
  if (iOS) return true;

  const webkit = !!ua.match(/WebKit/i);
  const notSafariDesktop = ua.match(/(?:chrome|firefox|opera|brave)/i);

  return webkit && !notSafariDesktop;
};

useResizeObserver(rootContainer, (entries) => {
  const entry = entries[0];
  const { width, height } = entry.contentRect;
  windowWidth.value = width;
  windowHeight.value = height;
});

onMounted(() => {
  toast.add({
    title: "Please enable location access.",
    description: "This calculator needs location access to work, please enable location access for this calculator to work properly.",
    duration: 5000
  });

  if (isSafari()) {
    usingSafari.value = true;
    console.log("Using Safari.")

    toast.add({
      title: "Safari detected, image downloading may not work.",
      description: "Image downloading does not work correctly on Safari, please use a different browser if the image downloaded is blank.",
      color: "warning",
      duration: 0,
    });
  }
});

useHead({
  title: 'Prayer Times Wallpaper',
  meta: [
    { name: 'description', content: 'Calculates Salah times and generates a wallpaper to download for your phone.' }
  ]
})
</script>

<template>
  <UApp>
    <div ref="rootContainer" class="root-container mx-auto min-w-[5rem] min-h-[80vh] w-[90%] sm:w-[85%] md:w-[80%] lg:w-[75%] max-w-[1400px]">
      <div class="px-4">
        <!-- Header -->
        <header class="flex gap-2 items-center justify-center py-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Prayer Times Wallpaper
          </h1>
        </header>

        <div class="pb-10">
          <HomePage :windowWidth="windowWidth" :windowHeight="windowHeight" :usingSafari="usingSafari" />
        </div>
      </div>

      <footer class="footer flex gap-2 items-center justify-center text-center py-6 px-4 mt-8 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500">
        <p class="m-0 leading-[0]">Built by <a href="https://github.com/ArdaxHz" target="_blank" class="footer-link text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Ardax</a> · <a href="https://github.com/ArdaxHz/prayer-times-wallpaper" target="_blank" class="footer-link text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Source</a> · 2026</p>
        <UButton
            :icon="isDark ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid'"
            variant="ghost"
            color="neutral"
            size="lg"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="isDark = !isDark"
          />
      </footer>
    </div>
  </UApp>
</template>


<style>
* {
  font-family: 'Vazirmatn', Helvetica, sans-serif;
}

@font-face {
  font-family: 'Vazirmatn';
  src: url('@/assets/fonts/Vazirmatn.ttf') format("truetype");
}

@font-face {
  font-family: 'Gilroy';
  src: url('@/assets/fonts/Gilroy Regular.ttf') format("truetype");
  font-weight: 400;
}

@font-face {
  font-family: 'Gilroy';
  src: url('@/assets/fonts/Gilroy Medium.ttf') format("truetype");
  font-weight: 500;
}

@font-face {
  font-family: 'Gilroy';
  src: url('@/assets/fonts/Gilroy SemiBold.ttf') format("truetype");
  font-weight: 600;
}

@font-face {
  font-family: 'Gilroy';
  src: url('@/assets/fonts/Gilroy Bold.ttf') format("truetype");
  font-weight: 700;
}

@font-face {
  font-family: 'Gilroy';
  src: url('@/assets/fonts/Gilroy ExtraBold.ttf') format("truetype");
  font-weight: 800;
}

@font-face {
  font-family: 'Gilroy';
  src: url('@/assets/fonts/Gilroy Heavy.ttf') format("truetype");
  font-weight: 900;
}
</style>
