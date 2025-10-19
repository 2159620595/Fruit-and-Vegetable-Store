<!-- src/components/RegionSelector.vue -->
<template>
  <div class="region-selector">
    <el-cascader
      v-model="selectedRegion"
      :options="regionOptions"
      placeholder="请选择省市区"
      @change="handleChange"
      :props="cascaderProps"
      clearable
      filterable
      style="width: 100%"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { regionData } from 'element-china-area-data'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择省市区',
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// 级联选择器配置
const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  expandTrigger: 'hover',
}

// 响应式数据
const selectedRegion = ref([])

// 地区选项
const regionOptions = computed(() => regionData)

// 监听外部值变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue && Array.isArray(newValue)) {
      selectedRegion.value = [...newValue]
    }
  },
  { immediate: true }
)

// 处理选择变化
const handleChange = value => {
  selectedRegion.value = value || []
  emit('update:modelValue', selectedRegion.value)

  // 生成地区字符串
  if (value && value.length === 3) {
    const province = regionData.find(p => p.value === value[0])
    const city = province?.children.find(c => c.value === value[1])
    const district = city?.children.find(d => d.value === value[2])

    if (province && city && district) {
      const regionString = `${province.label} ${city.label} ${district.label}`
      emit('change', {
        value: selectedRegion.value,
        string: regionString,
        province: province.label,
        city: city.label,
        district: district.label,
      })
    }
  } else {
    emit('change', {
      value: selectedRegion.value,
      string: '',
      province: '',
      city: '',
      district: '',
    })
  }
}

// 解析地区字符串为数组
const parseRegionString = regionString => {
  if (!regionString) return []

  const parts = regionString.split(' ')
  if (parts.length !== 3) return []

  const province = regionData.find(p => p.label === parts[0])
  if (!province) return []

  const city = province.children.find(c => c.label === parts[1])
  if (!city) return []

  const district = city.children.find(d => d.label === parts[2])
  if (!district) return []

  return [province.value, city.value, district.value]
}

// 暴露方法给父组件
defineExpose({
  parseRegionString,
  clear: () => {
    selectedRegion.value = []
    emit('update:modelValue', [])
  },
})
</script>

<style scoped>
.region-selector {
  width: 100%;
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-cascader .el-input) {
  width: 100%;
}
</style>
