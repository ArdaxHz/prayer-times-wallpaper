<script setup>
import { calculateAdhanMonth, calculateAdhanHijriMonth, getNext12HijriMonths } from '~/composables/adhantimes';
const toast = useToast();

const props = defineProps({
    latitude: Number,
    longitude: Number,
    gregorianDate: Object
})

const emits = defineEmits(['updatePrayerTimetable', 'updateSelectedHijriMonth', 'updateUse24Hour'])

const fajrAngle = ref(18);
const sightingCommittee = ref('MuslimWorldLeague');
const madhabMethod = ref('shafi');
// Calendar type toggle
const calendarType = ref('hijri');
const calendarTypes = [{ value: 'hijri', label: 'Hijri' }, { value: 'gregorian', label: 'Gregorian' }];

// Hijri month selection
const hijriMonths = ref(getNext12HijriMonths());
const selectedHijriMonthIndex = ref(0);

// Gregorian month selection
const formMonthSelect = ref(new Date().getMonth());
const gregorianMonths = ref((function () {
    const monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date();
    const currentYear = d.getFullYear();
    const nextYear = currentYear + 1;
    const rest = monthsNames.slice(d.getMonth()).map((month) => {
        return { index: monthsNames.indexOf(month), name: `${month} ${currentYear}`, year: currentYear };
    });
    const gone = monthsNames.slice(0, d.getMonth()).map((month) => {
        return { index: monthsNames.indexOf(month), name: `${month} ${nextYear}`, year: nextYear };
    });
    return rest.concat(gone);
})());

// Hijri date convention
const hijriConvention = ref('midnight');
const hijriConventionOptions = [
    { value: 'midnight', label: 'Midnight' },
    { value: 'maghrib', label: 'Maghrib' },
];

// Time format
const use24Hour = ref(false);
const timeFormatOptions = [
    { value: false, label: '12 Hour' },
    { value: true, label: '24 Hour' },
];

// Advanced settings
const showAdvanced = ref(false);
const showAdjustments = ref(false);
const highLatitudeRule = ref('recommended');
const polarCircleResolution = ref('Unresolved');
const shafaq = ref('General');
const rounding = ref('Nearest');
const ishaAngle = ref(null);
const maghribAngle = ref(null);

// Per-prayer adjustments (minutes) — explicit refs for reactivity
const adjFajr = ref(0);
const adjSunrise = ref(0);
const adjDhuhr = ref(0);
const adjAsr = ref(0);
const adjMaghrib = ref(0);
const adjIsha = ref(0);

const madhabs = [{ "value": "shafi", "label": "Early" }, { "value": "hanafi", "label": "Late" }];
const sightingCommitteeList = [{ "value": "MuslimWorldLeague", "label": "Muslim World League" }, { "value": "Egyptian", "label": "Egyptian" }, { "value": "Karachi", "label": "Karachi" }, { "value": "UmmAlQura", "label": "Umm Al Qura" }, { "value": "Dubai", "label": "Dubai" }, { "value": "MoonsightingCommittee", "label": "Moonsighting Committee" }, { "value": "NorthAmerica", "label": "North America" }, { "value": "Kuwait", "label": "Kuwait" }, { "value": "Qatar", "label": "Qatar" }, { "value": "Singapore", "label": "Singapore" }, { "value": "Tehran", "label": "Tehran" }, { "value": "Turkey", "label": "Turkey" }];
const highLatitudeRules = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'MiddleOfTheNight', label: 'Middle of the Night' },
    { value: 'SeventhOfTheNight', label: 'Seventh of the Night' },
    { value: 'TwilightAngle', label: 'Twilight Angle' }
];
const polarCircleResolutions = [
    { value: 'Unresolved', label: 'Unresolved' },
    { value: 'AqrabBalad', label: 'Aqrab Balad' },
    { value: 'AqrabYaum', label: 'Aqrab Yaum' }
];
const shafaqOptions = [
    { value: 'General', label: 'General' },
    { value: 'Ahmer', label: 'Ahmer (Red)' },
    { value: 'Abyad', label: 'Abyad (White)' }
];
const roundingOptions = [
    { value: 'Nearest', label: 'Nearest' },
    { value: 'Up', label: 'Up' },
    { value: 'None', label: 'None' }
];

const hijriMonthOptions = computed(() =>
    hijriMonths.value.map((m, i) => ({ value: i, label: m.label }))
);

const isHijri = computed(() => calendarType.value === 'hijri');
const isMoonsightingCommittee = computed(() => sightingCommittee.value === 'MoonsightingCommittee');

const isLocationEmpty = computed(() => {
    return props.latitude == null || props.longitude == null;
});

function clampAngle(val) {
    const n = Number(val);
    if (isNaN(n)) return null;
    return Math.max(0, Math.min(90, n));
}

function clampAdjustment(val) {
    const n = Number(val);
    if (isNaN(n)) return 0;
    return Math.max(-60, Math.min(60, Math.round(n)));
}

function buildCustomParams() {
    const customParams = {
        fajrAngle: fajrAngle.value,
        CalculationMethod: sightingCommittee.value,
        madhab: madhabMethod.value,
        highLatitudeRule: highLatitudeRule.value,
        polarCircleResolution: polarCircleResolution.value,
        rounding: rounding.value,
        hijriConvention: hijriConvention.value,
    };

    if (isMoonsightingCommittee.value) {
        customParams.shafaq = shafaq.value;
    }
    if (ishaAngle.value != null && ishaAngle.value !== '') {
        customParams.ishaAngle = clampAngle(ishaAngle.value);
    }
    if (maghribAngle.value != null && maghribAngle.value !== '') {
        customParams.maghribAngle = clampAngle(maghribAngle.value);
    }

    const adj = {
        fajr: clampAdjustment(adjFajr.value),
        sunrise: clampAdjustment(adjSunrise.value),
        dhuhr: clampAdjustment(adjDhuhr.value),
        asr: clampAdjustment(adjAsr.value),
        maghrib: clampAdjustment(adjMaghrib.value),
        isha: clampAdjustment(adjIsha.value),
    };
    if (Object.values(adj).some(v => v !== 0)) {
        customParams.adjustments = adj;
    }

    return customParams;
}

function calculateMonth() {
    if (isLocationEmpty.value) {
        return;
    }

    try {
        const customParams = buildCustomParams();

        if (isHijri.value) {
            const selected = hijriMonths.value[selectedHijriMonthIndex.value];
            if (!selected) return;

            const prayerTimes = calculateAdhanHijriMonth(
                props.latitude, props.longitude,
                selected.hijriYear, selected.hijriMonth,
                customParams
            );
            emits('updatePrayerTimetable', prayerTimes);
            emits('updateSelectedHijriMonth', selected);
        } else {
            const selectedOption = gregorianMonths.value.find(option => option.index === formMonthSelect.value);
            if (!selectedOption) return;

            const date = new Date();
            date.setMonth(selectedOption.index);
            date.setFullYear(selectedOption.year);

            const prayerTimes = calculateAdhanMonth(
                props.latitude, props.longitude,
                date, customParams
            );
            emits('updatePrayerTimetable', prayerTimes);
            emits('updateSelectedHijriMonth', null);
        }
    } catch (error) {
        console.error('Prayer time calculation error:', error);
        toast.add({
            title: "Calculation error.",
            description: error.message || "An error occurred while calculating prayer times.",
            color: "error"
        });
    }
}

function autoCalculate() {
    calculateMonth();
}

// Watch all reactive form values
watch(
    [fajrAngle, sightingCommittee, madhabMethod, selectedHijriMonthIndex, formMonthSelect, calendarType,
     hijriConvention, highLatitudeRule, polarCircleResolution, shafaq, rounding,
     ishaAngle, maghribAngle,
     adjFajr, adjSunrise, adjDhuhr, adjAsr, adjMaghrib, adjIsha],
    () => { calculateMonth(); }
);

watch(use24Hour, (val) => {
    emits('updateUse24Hour', val);
});

watch(() => props.latitude, () => {
    autoCalculate()
})

onMounted(() => {
    hijriMonths.value = getNext12HijriMonths();
    if (props.latitude != null && props.longitude != null) {
        autoCalculate();
    }
})
</script>

<template>
    <div class="form-container flex gap-4 flex-col">
        <div class="flex flex-col gap-4 sm:gap-5">
            <!-- Fajr Angle -->
            <div class="form-row">
                <div class="form-label-cell">
                    <UFormField label="Fajr Angle:">
                        <template #label>
                            <span class="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Fajr Angle:</span>
                        </template>
                    </UFormField>
                </div>
                <div class="form-input-cell">
                    <UInput type="number" v-model="fajrAngle" size="md" :min="0" :max="90" step="0.1" class="w-full" />
                </div>
            </div>

            <!-- Sighting Committee -->
            <div class="form-row">
                <div class="form-label-cell">
                    <UFormField label="Sighting Committee:">
                        <template #label>
                            <span class="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Sighting Committee:</span>
                        </template>
                    </UFormField>
                </div>
                <div class="form-input-cell">
                    <USelectMenu v-model="sightingCommittee" :items="sightingCommitteeList" value-key="value"
                        label-key="label" size="md" class="w-full" />
                </div>
            </div>

            <!-- Asr Time -->
            <div class="form-row">
                <div class="form-label-cell">
                    <UFormField label="Asr Time:">
                        <template #label>
                            <span class="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Asr Time:</span>
                        </template>
                    </UFormField>
                </div>
                <div class="form-input-cell">
                    <div class="form-radio-group">
                        <button v-for="madhab of madhabs" :key="madhab.value"
                            type="button"
                            class="pill-btn"
                            :class="{ 'pill-btn-active': madhabMethod === madhab.value }"
                            @click="madhabMethod = madhab.value">
                            {{ madhab.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Calendar -->
            <div class="form-row">
                <div class="form-label-cell">
                    <UFormField label="Calendar:">
                        <template #label>
                            <span class="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Calendar:</span>
                        </template>
                    </UFormField>
                </div>
                <div class="form-input-cell">
                    <div class="form-radio-group">
                        <button v-for="cal of calendarTypes" :key="cal.value"
                            type="button"
                            class="pill-btn"
                            :class="{ 'pill-btn-active': calendarType === cal.value }"
                            @click="calendarType = cal.value">
                            {{ cal.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Month -->
            <div class="form-row">
                <div class="form-label-cell">
                    <UFormField label="Month:">
                        <template #label>
                            <span class="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Month:</span>
                        </template>
                    </UFormField>
                </div>
                <div class="form-input-cell">
                    <USelectMenu v-if="isHijri" v-model="selectedHijriMonthIndex" :items="hijriMonthOptions"
                        value-key="value" label-key="label" size="md" class="w-full" />
                    <USelectMenu v-else v-model="formMonthSelect" :items="gregorianMonths"
                        value-key="index" label-key="name" size="md" class="w-full" />
                </div>
            </div>

        </div>

        <!-- Advanced Settings -->
        <div class="mt-2">
            <UButton
                :icon="showAdvanced ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                variant="ghost"
                color="neutral"
                class="text-gray-900 dark:text-white font-semibold text-sm"
                @click="showAdvanced = !showAdvanced"
            >
                Advanced Settings
            </UButton>

            <div v-if="showAdvanced" class="mt-3 flex flex-col gap-4 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Time Format:</span>
                    <div class="form-radio-group">
                        <button v-for="opt of timeFormatOptions" :key="opt.label"
                            type="button"
                            class="pill-btn pill-btn-sm"
                            :class="{ 'pill-btn-active': use24Hour === opt.value }"
                            @click="use24Hour = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Hijri Changes At:</span>
                    <div class="form-radio-group">
                        <button v-for="opt of hijriConventionOptions" :key="opt.value"
                            type="button"
                            class="pill-btn pill-btn-sm"
                            :class="{ 'pill-btn-active': hijriConvention === opt.value }"
                            @click="hijriConvention = opt.value">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">High Latitude Rule:</span>
                    <USelect v-model="highLatitudeRule" :items="highLatitudeRules" value-key="value"
                        label-key="label" size="sm" class="w-full" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Polar Circle Resolution:</span>
                    <USelect v-model="polarCircleResolution" :items="polarCircleResolutions" value-key="value"
                        label-key="label" size="sm" class="w-full" />
                </div>
                <div v-if="isMoonsightingCommittee" class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Shafaq (Twilight):</span>
                    <USelect v-model="shafaq" :items="shafaqOptions" value-key="value"
                        label-key="label" size="sm" class="w-full" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Rounding:</span>
                    <USelect v-model="rounding" :items="roundingOptions" value-key="value"
                        label-key="label" size="sm" class="w-full" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Isha Angle Override:</span>
                    <UInput type="number" v-model="ishaAngle" size="sm" placeholder="Default"
                        :min="0" :max="90" step="0.1" class="w-full" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">Maghrib Angle Override:</span>
                    <UInput type="number" v-model="maghribAngle" size="sm" placeholder="Default"
                        :min="0" :max="90" step="0.1" class="w-full" />
                </div>

                <!-- Per-prayer adjustments — each ref bound explicitly -->
                <div>
                    <UButton
                        :icon="showAdjustments ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                        variant="ghost"
                        color="neutral"
                        class="text-gray-900 dark:text-white font-semibold text-xs"
                        size="xs"
                        @click="showAdjustments = !showAdjustments"
                    >
                        Per-Prayer Adjustments (minutes)
                    </UButton>

                    <div v-if="showAdjustments" class="mt-2 flex flex-col gap-2 pl-2 border-l-2 border-gray-300 dark:border-gray-700">
                        <div class="grid grid-cols-2 gap-2 items-center">
                            <span class="text-xs text-gray-500 dark:text-gray-300">Fajr:</span>
                            <UInput type="number" v-model="adjFajr" size="xs" :min="-60" :max="60" step="1" class="w-full" />
                        </div>
                        <div class="grid grid-cols-2 gap-2 items-center">
                            <span class="text-xs text-gray-500 dark:text-gray-300">Sunrise:</span>
                            <UInput type="number" v-model="adjSunrise" size="xs" :min="-60" :max="60" step="1" class="w-full" />
                        </div>
                        <div class="grid grid-cols-2 gap-2 items-center">
                            <span class="text-xs text-gray-500 dark:text-gray-300">Dhuhr:</span>
                            <UInput type="number" v-model="adjDhuhr" size="xs" :min="-60" :max="60" step="1" class="w-full" />
                        </div>
                        <div class="grid grid-cols-2 gap-2 items-center">
                            <span class="text-xs text-gray-500 dark:text-gray-300">Asr:</span>
                            <UInput type="number" v-model="adjAsr" size="xs" :min="-60" :max="60" step="1" class="w-full" />
                        </div>
                        <div class="grid grid-cols-2 gap-2 items-center">
                            <span class="text-xs text-gray-500 dark:text-gray-300">Maghrib:</span>
                            <UInput type="number" v-model="adjMaghrib" size="xs" :min="-60" :max="60" step="1" class="w-full" />
                        </div>
                        <div class="grid grid-cols-2 gap-2 items-center">
                            <span class="text-xs text-gray-500 dark:text-gray-300">Isha:</span>
                            <UInput type="number" v-model="adjIsha" size="xs" :min="-60" :max="60" step="1" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<style>
.form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
    align-items: center;
}

@media (min-width: 640px) {
    .form-row {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
}

.form-label-cell {
    display: flex;
    align-items: center;
    justify-content: start;
    text-align: left;
    min-height: 2rem;
}

.form-label-cell > * {
    display: flex;
    align-items: center;
}

.form-input-cell {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 2.5rem;
    width: 100%;
}

.form-input-cell > * {
    width: 100%;
}

.form-container {
    font-size: 1.125rem;
    line-height: 1.75rem;
}

.form-radio-group {
    display: flex;
    flex: 1 1 0px;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: end;
    align-items: center;
    margin: 0;
}

.pill-btn {
    display: flex;
    cursor: pointer;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #111827;
    box-shadow: inset 0 0 0 1px #d1d5db;
    transition: all 0.15s;
}

.pill-btn-sm {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
}

.pill-btn:hover {
    background-color: #ecfeff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pill-btn-active {
    background-color: #0891b2;
    color: white;
    box-shadow: inset 0 0 0 1px #0891b2;
}

.pill-btn-active:hover {
    background-color: #0e7490;
}

.dark .pill-btn {
    color: white;
    box-shadow: inset 0 0 0 1px #374151;
}

.dark .pill-btn:hover {
    background-color: #083344;
}

.dark .pill-btn-active {
    background-color: #155e75;
    box-shadow: inset 0 0 0 1px #155e75;
}

.dark .pill-btn-active:hover {
    background-color: #0e7490;
    box-shadow: inset 0 0 0 1px #0e7490;
}
</style>
