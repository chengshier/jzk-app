<template>
    <view class="ui11-page">
        <view class="ui11-nav">
            <navigator open-type="navigateBack" class="ui11-nav__back">‹</navigator><text
                class="ui11-nav__title">选择药品</text><text class="ui11-nav__placeholder"></text>
        </view>
        <view class="search-row"><text>⌕　输入药品名称</text><text class="remind">◷　用药提醒</text></view>
        <view class="tabs"><text>◷<small>最近添加</small></text><text
                class="active">●<small>常见</small></text><text>▦<small>自定义</small></text></view>
        <view class="medicine-list">
            <view v-for="item in medicines" :key="item.name"><b>{{ item.name }}</b><text>{{ item.detail }}</text></view>
        </view>
        <view class="ui11-fixed-action">
            <view class="ui11-primary-btn">确定</view>
        </view>
    </view>
</template>
<script>export default { data() { return { medicines: [{ name: '复方头孢克洛片', detail: '浙江巨泰　16mg' }, { name: '贝敏伪麻片', detail: '备硫　复方' }, { name: '牛黄蛇胆川贝片', detail: '江西保利　0.41g' }] } } }</script>
<style lang="scss"
    scoped>
    .search-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 96rpx;
        padding: 0 28rpx;
        border-radius: 999rpx;
        background: #f6f7f8;
        color: #afb1b5;
        font-size: 28rpx
    }

    .remind {
        color: #333
    }

    .tabs {
        display: flex;
        justify-content: space-around;
        padding: 50rpx 20rpx 34rpx;
        color: #c2c3c5;
        font-size: 40rpx
    }

    .tabs text {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx
    }

    .tabs small {
        font-size: 28rpx
    }

    .tabs .active {
        color: #29c8a6
    }

    .medicine-list view {
        display: flex;
        min-height: 158rpx;
        flex-direction: column;
        justify-content: center;
        border-bottom: 1rpx solid #eceef0
    }

    .medicine-list b {
        font-size: 34rpx
    }

    .medicine-list text {
        margin-top: 13rpx;
        color: #a8aaad;
        font-size: 27rpx
    }
</style>
