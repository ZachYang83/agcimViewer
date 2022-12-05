<template>
	<div class="colorstamp-box">
		<a-dropdown>
			<a class="ant-dropdown-link">
				<span :style="curStamp"></span>
				<a-icon type="down" style="margin-left: 10px;" />
			</a>
			<a-menu slot="overlay" @click="colorRampClick" class="stamp-list">
				<a-menu-item v-for="(val, key) in list" :key="key">
					<div class="item" :ref="key" :style="val.style"></div>
				</a-menu-item>
			</a-menu>
		</a-dropdown>
		<!-- 图例 -->
		<div class="legend-box" ref="legendBox"></div>
	</div>
</template>

<script>
export default {
	name: 'ColorStamp',
	data() {
		return {
			curStamp: '',
			list: [
				{
					type: 'block',
					style: '',
					arr: [
						{
							color: '#FF0000',
							text: '未达到最低日照要求',
						},
						{
							color: '#FFFF00',
							text: '超过最低日照要求1h以内',
						},
						{
							color: '#008000',
							text: '超过最低日照要求1-2h',
						},
						{
							color: '#00FFFF',
							text: '超过最低日照要求2-3h',
						},
						{
							color: '#0000FF',
							text: '超过最低日照要求3-4h',
						},
						{
							color: '#800080',
							text: '超过最低日照要求4h以上',
						},
					],
				},
				{
					type: 'block',
					style: '',
					arr: [
						{
							color: '#FF0000',
							text: '< 3h，未达标',
						},
						{
							color: '#FFFF00',
							text: '> 3h，达标',
						},
					],
				},
				{
					type: 'gradient',
					style: '',
					arr: [
						{
							color: '#FF0000',
							text: '未达标',
						},
						{
							color: '#008000',
							text: '达标，日照超过最低要求1h',
						},
						{
							color: '#0000FF',
							text: '达标，日照超过最低要求3h',
						},
					],
				},
				{
					type: 'gradient',
					style: '',
					arr: [
						{
							color: '#FF0000',
							text: '< 3h，未达标',
						},
						{
							color: '#FFFF00',
							text: '> 3h，达标',
						},
					],
				},
			],
		};
	},
	mounted() {
		this.initColorRamp();
	},
	methods: {
		initColorRamp() {
			for (let i = 0; i < this.list.length; i++) {
				this.getColorRamp(this.list[i], 90);
			}
			this.colorRampClick({ key: 0 });
		},
		colorRampClick(val) {
			this.curStamp = this.list[val.key].style;
			this.$emit('getStamp', this.list[val.key]);
			//图例
			let w = 10;
			let arr = this.list[val.key].arr;
			var c = document.createElement('canvas');
			c.width = 200;
			c.height = 20 * arr.length + 5;
			var ctx = c.getContext('2d');
			for (let i = 0; i < arr.length; i++) {
				ctx.beginPath();
				ctx.fillStyle = arr[i].color;
				ctx.fillRect(w, 20 * i + 10, 10, 10);

				ctx.beginPath();
				ctx.font = '14px Arial';
				ctx.textBaseline = 'hanging';
				ctx.fillStyle = '#000';
				ctx.fillText(arr[i].text, 3 * w, 20 * i + 10);
			}
			this.$refs.legendBox.innerHTML = '';
			this.$refs.legendBox.appendChild(c);
		},
		getColorRamp(o, w = 100, h = 10) {
			var arr = o.arr;
			var type = o.type;
			if (type == 'block') {
				let str = `display:inline-block;width:${w}px;height:${h}px;background: linear-gradient(90deg, ${
					arr[0].color
				}  ${agcim.utils.commonUtils.toPercent(1 / arr.length)}`;
				for (let i = 1; i < arr.length; i++) {
					str = `${str},${
						arr[i].color
					} ${agcim.utils.commonUtils.toPercent(
						i / arr.length
					)} ${agcim.utils.commonUtils.toPercent(
						(i + 1) / arr.length
					)}`;
				}
				o.style = str + ');';
			} else {
				//gradient
				let style = [];
				for (let i = 0; i < arr.length; i++) {
					style.push(arr[i].color);
				}
				o.style = `display:inline-block;width:${w}px;height:${h}px;background-image: linear-gradient(90deg, ${style.toString()}); `;
			}
		},
	},
};
</script>
<style scoped>
.legend-box {
	position: fixed;
	bottom: 40px;
	left: 470px;
	max-height: 200px;
	overflow: auto;
	background: #fff;
	padding: 10px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.25);
	border-radius: 2px;
}
</style>
