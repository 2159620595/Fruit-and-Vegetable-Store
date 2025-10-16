<template>
  <div class="region-selector">
    <select v-model="selectedProvince" @change="onProvinceChange" class="region-select">
      <option value="">请选择省份</option>
      <option v-for="province in provinces" :key="province.code" :value="province.code">
        {{ province.name }}
      </option>
    </select>

    <select
      v-model="selectedCity"
      @change="onCityChange"
      class="region-select"
      :disabled="!selectedProvince"
    >
      <option value="">请选择城市</option>
      <option v-for="city in cities" :key="city.code" :value="city.code">
        {{ city.name }}
      </option>
    </select>

    <select
      v-model="selectedDistrict"
      @change="onDistrictChange"
      class="region-select"
      :disabled="!selectedCity"
    >
      <option value="">请选择区县</option>
      <option v-for="district in districts" :key="district.code" :value="district.code">
        {{ district.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getProvinces, getCitiesByProvince, getDistrictsByCity, regions } from '@/data/regions'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// 选中的省市区代码
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')

// 所有省份
const provinces = ref(getProvinces())

// 当前省份的城市列表
const cities = computed(() => {
  if (!selectedProvince.value) return []
  return getCitiesByProvince(selectedProvince.value)
})

// 当前城市的区县列表
const districts = computed(() => {
  if (!selectedProvince.value || !selectedCity.value) return []
  return getDistrictsByCity(selectedProvince.value, selectedCity.value)
})

// 初始化：从 modelValue 解析省市区
const parseRegion = (regionString) => {
  if (!regionString) return

  // 格式：广东省 深圳市 南山区
  const parts = regionString.split(' ').filter((p) => p)
  if (parts.length === 0) return

  // 查找省份
  const provinceName = parts[0]
  const province = regions.find((p) => p.name === provinceName)
  if (province) {
    selectedProvince.value = province.code

    // 查找城市
    if (parts.length > 1) {
      const cityName = parts[1]
      const city = province.cities.find((c) => c.name === cityName)
      if (city) {
        selectedCity.value = city.code

        // 查找区县
        if (parts.length > 2) {
          const districtName = parts[2]
          const district = city.districts.find((d) => d.name === districtName)
          if (district) {
            selectedDistrict.value = district.code
          }
        }
      }
    }
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      parseRegion(newVal)
    }
  },
  { immediate: true }
)

// 省份变化
const onProvinceChange = () => {
  selectedCity.value = ''
  selectedDistrict.value = ''
  emitRegion()
}

// 城市变化
const onCityChange = () => {
  selectedDistrict.value = ''
  emitRegion()
}

// 区县变化
const onDistrictChange = () => {
  emitRegion()
}

// 发送选中的地区
const emitRegion = () => {
  let regionString = ''

  if (selectedProvince.value) {
    const province = regions.find((p) => p.code === selectedProvince.value)
    if (province) {
      regionString = province.name

      if (selectedCity.value) {
        const city = province.cities.find((c) => c.code === selectedCity.value)
        if (city) {
          regionString += ' ' + city.name

          if (selectedDistrict.value) {
            const district = city.districts.find((d) => d.code === selectedDistrict.value)
            if (district) {
              regionString += ' ' + district.name
            }
          }
        }
      }
    }
  }

  emit('update:modelValue', regionString)
}
</script>

<style scoped>
.region-selector {
  display: flex;
  gap: 12px;
}

.region-select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  background-color: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.region-select:focus {
  outline: none;
  border-color: #2d5a27;
}

.region-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999999;
}

@media (max-width: 768px) {
  .region-selector {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

