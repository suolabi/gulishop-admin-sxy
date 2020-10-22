<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>
    <!--
      参考官网最下边的属性
      data:接收动态数据，给到下边的每一个el-table-column列
      border：代表有边框
      stripe：斑马纹
      el-table-column：每一列都暗含了for循环
      type="index"：序号列，自动生成序号
      prop：对应列内容的字段名，在这里就是显示数组中对应的属性名，写上哪个属性，就会自动遍历展示哪个属性，但只会展示原本的数据，如果需要不用的结构就需要用到作用域插槽
      在table中，每一个列在展示trademark数组中的对象的某一个属性，但展示这个属性的时候只是展示这个属性本身的数据，如果需要其他的结构就需要作用域插槽
      label：代表这一列的名字
      width：代表这一列宽度
      align：对齐方式
    -->
    <el-table
      :data="trademarkList"
      style="width: 100%; margin: 20px 0"
      border
      stripe
    >
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="tmName"
        label="品牌名称"
        width="width"
      ></el-table-column>
      <el-table-column prop="logoUrl" label="品牌logo" width="width">
        <!-- 作用域插槽
        以后在table中，只要内部数据的显示和结构是不一样的，必然会用到作用域插槽
        每遍历一个传过来一个，放到img标签中展示
        row：这里名字是固定的，代表行的意思，是trademark的每一个对象
        $index：也是固定的名字，每一行的下标
        注意：用到了作用域插槽，prop可以不写
         -->
        <template slot-scope="{ row, $index }">
          <!-- 在这里要传显示的结构 -->
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 60px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <!-- 这里也是内部有其他结构了，就一个需要作用域插槽 -->
        <template slot-scope="{ row, $index }">
          <el-button type="warning" icon="el-icon-edit" size="mini"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      style="text-align: center"
      :current-page="1"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper, ->, sizes, total "
      :total="total"
    >
    </el-pagination>

    <!--增加和修改的dialog -->
    <!-- :visible.sync  用来控制点击叉号关闭 -->
    <el-dialog title="添加品牌" :visible.sync="isShowDialog">
      <!-- :model="form"  这里要接收一个对象，下边所有收集到的信息都存入这个对象中 -->
      <el-form :model="form" style="width: 80%">
        <!-- :label-width： 控制显示名称的宽度 -->
        <el-form-item label="品牌名称" :label-width="'100px'">
          <!-- v-model:用来收集表单数据 -->
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'">
          <!-- 
            action:上传文件的路径，注意跨域问题
            :show-file-list：是否展示多张图片，上传多张能用到
            :on-success：上传成功的回调
            :before-upload：上传之前的回调
           -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg文件，且不超过2M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      isShowDialog: false,
      // imageUrl: "",

      form: {
        tmName: "",
        logoUrl:''
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    // size是新选择的条数，事件触发会自动传递参数
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },


    showAddDialog(){
      this.isShowDialog = true,
      this.form={
        tmName: "",
        logoUrl:''
      }
    },

    //上传成功的回调函数
    handleAvatarSuccess(res, file) {
      //上传成功后，会返回上传成功的图片的真实的路径
      //我们需要做的很简单就是把这个图片的路径赶紧收集起来
      // console.log(res,file,URL.createObjectURL(file.raw))
      this.form.logoUrl = res.data;
      // this.imageUrl = URL.createObjectURL(file.raw); //拿的是图片的本地路径,假的路径
    },

    //在上传之前可以对上传的文件做限制
    beforeAvatarUpload(file) {
      // 上传图片的类型
      const isJPG = file.type === "image/jpeg";
      // 上传图片的大小
      // 计算机中显示的文件大小都是以字节为单位
      // 这个计算限制上传的文件小于2MS
      const isLt2M = file.size / 1024 / 1024 < 2;

      // const typeArr = ["image/jpeg", "image/png"];
      // const isJPGOrPNG = typeArr.some((item) => item === file.type);
      // const isLt500K = file.size / 1024 < 500;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      // 两个都为true才能返回,在这一步强制上传也能成功
      return isJPG && isLt2M;
    },


    //点击确定按钮添加或者修改trademark的请求逻辑
    async addOrUpdateTrademark(){
      // 获取参数
      let trademark = this.form
      // 整理参数 ===》最麻烦
      // 发请求
      const result = await this.$API.trademark.addOrUpdate(trademark)
      // 成功干啥
      if(result.code === 200){
        //1、提示添加或者修改成功
        this.$message.success('添加品牌车成功')
        //2、关闭dialog
        this.isShowDialog = false;
        //3、重新获取列表数据展示
        this.getTrademarkList();
      }else{
      // 失败干啥
      this.$message.error('添加品牌失败')
      }
    }
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

