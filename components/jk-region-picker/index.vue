<template>
  <view class="jk-region-picker">
    <view class="jk-region-picker__row">
      <picker mode="selector" :range="provinceNames" :value="provinceIndex" @change="onProvinceChange">
        <view class="jk-region-picker__cell">{{ selectedProvinceName || '选择省份' }}</view>
      </picker>
      <picker mode="selector" :range="cityNames" :value="cityIndex" :disabled="!cities.length" @change="onCityChange">
        <view class="jk-region-picker__cell" :class="{ disabled: !cities.length }">{{ selectedCityName || '选择城市' }}</view>
      </picker>
      <picker mode="selector" :range="districtNames" :value="districtIndex" :disabled="!districts.length" @change="onDistrictChange">
        <view class="jk-region-picker__cell" :class="{ disabled: !districts.length }">{{ selectedDistrictName || '选择区县' }}</view>
      </picker>
    </view>
    <view v-if="loading" class="jk-region-picker__hint">区域数据加载中…</view>
    <view v-else-if="error" class="jk-region-picker__error" @click="loadProvinces">{{ error }}，点击重试</view>
    <view v-else-if="pathName" class="jk-region-picker__hint">当前：{{ pathName }}</view>
  </view>
</template>

<script>
import { getJkRegionOptions } from '@/api/jkV31.js';

export default {
  name: 'JkRegionPicker',
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '' }
  },
  data() {
    return {
      provinces: [],
      cities: [],
      districts: [],
      provinceIndex: 0,
      cityIndex: 0,
      districtIndex: 0,
      selectedProvince: null,
      selectedCity: null,
      selectedDistrict: null,
      loading: false,
      error: '',
      pathName: this.label || ''
    };
  },
  computed: {
    provinceNames() { return this.provinces.map(item => item.label); },
    cityNames() { return this.cities.map(item => item.label); },
    districtNames() { return this.districts.map(item => item.label); },
    selectedProvinceName() { return this.selectedProvince ? this.selectedProvince.label : ''; },
    selectedCityName() { return this.selectedCity ? this.selectedCity.label : ''; },
    selectedDistrictName() { return this.selectedDistrict ? this.selectedDistrict.label : ''; }
  },
  watch: {
    label(value) { if (value) this.pathName = value; }
  },
  created() {
    this.loadProvinces();
  },
  methods: {
    async fetchOptions(params) {
      const res = await getJkRegionOptions(params);
      return Array.isArray(res.data) ? res.data.filter(item => !item.disabled) : [];
    },
    async loadProvinces() {
      this.loading = true;
      this.error = '';
      try {
        this.provinces = await this.fetchOptions({ targetLevel: 1 });
      } catch (error) {
        this.error = error || '区域数据加载失败';
      } finally {
        this.loading = false;
      }
    },
    async onProvinceChange(event) {
      this.provinceIndex = Number(event.detail.value || 0);
      this.selectedProvince = this.provinces[this.provinceIndex] || null;
      this.selectedCity = null;
      this.selectedDistrict = null;
      this.cities = [];
      this.districts = [];
      this.pathName = '';
      if (!this.selectedProvince) return;
      this.loading = true;
      try {
        this.cities = await this.fetchOptions({ parentRegionCode: this.selectedProvince.value, targetLevel: 2 });
      } catch (error) {
        this.error = error || '城市数据加载失败';
      } finally {
        this.loading = false;
      }
    },
    async onCityChange(event) {
      this.cityIndex = Number(event.detail.value || 0);
      this.selectedCity = this.cities[this.cityIndex] || null;
      this.selectedDistrict = null;
      this.districts = [];
      this.pathName = '';
      if (!this.selectedCity) return;
      this.loading = true;
      try {
        this.districts = await this.fetchOptions({ parentRegionCode: this.selectedCity.value, targetLevel: 3 });
      } catch (error) {
        this.error = error || '区县数据加载失败';
      } finally {
        this.loading = false;
      }
    },
    onDistrictChange(event) {
      this.districtIndex = Number(event.detail.value || 0);
      this.selectedDistrict = this.districts[this.districtIndex] || null;
      if (!this.selectedDistrict) return;
      this.pathName = [this.selectedProvinceName, this.selectedCityName, this.selectedDistrictName]
        .filter(Boolean).join(' / ');
      this.$emit('input', this.selectedDistrict.value);
      this.$emit('change', {
        regionCode: this.selectedDistrict.value,
        regionName: this.selectedDistrict.label,
        pathName: this.pathName
      });
    }
  }
};
</script>

<style scoped lang="scss">
.jk-region-picker {
  width: 100%;
}
.jk-region-picker__row {
  display: flex;
  gap: 12rpx;
}
.jk-region-picker__row picker {
  flex: 1;
  min-width: 0;
}
.jk-region-picker__cell {
  min-height: 64rpx;
  padding: 0 12rpx;
  border: 1rpx solid #e5e8ec;
  border-radius: 10rpx;
  background: #f8fafb;
  color: #333;
  font-size: 24rpx;
  line-height: 64rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.jk-region-picker__cell.disabled {
  color: #aaa;
}
.jk-region-picker__hint,
.jk-region-picker__error {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 32rpx;
  color: #8b95a1;
}
.jk-region-picker__error {
  color: #d94b4b;
}
</style>
