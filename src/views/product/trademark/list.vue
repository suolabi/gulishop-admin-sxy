<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >
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
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
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
    <el-dialog
      :title="form.id ? '修改品牌' : '添加品牌'"
      :visible.sync="isShowDialog"
    >
      <!-- :model="form"  这里要接收一个对象，下边所有收集到的信息都存入这个对象中 -->
      <el-form :model="form" :rules="rules" style="width: 80%" ref="form">
        <!-- :label-width： 控制显示名称的宽度 -->
        <el-form-item label="品牌名称" :label-width="'100px'" prop="tmName">
          <!-- v-model:用来收集表单数据 -->
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'" prop="logoUrl">
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
    // callback   验证通过和不同都是由这个函数来决定的  
    var validateTmName = (rule, value, callback) => {
      if(value.length < 2 || value.length > 10 ){
        callback(new Error('输入的名字必须是2-10个字符'))//不通过
      }else if(value.trim() === ''){
        callback(new Error('请输入合法的名称不能为空'))  //不通过
      }else{
        callback() //通过
      }
    };

    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      isShowDialog: false,
      // imageUrl: "",

      form: {
        tmName: "",
        logoUrl: "",
      },

      rules: {
        tmName: [
          // required: true   必填项
          // message          错误信息
          // trigger          验证规则的触发时机
          // blur      失去焦点的时候验证
          // change    内容改变的时候验证
          // 还有一个验证是点确定按钮整体验证
          // min              输入的最小字符
          // max              输入的最大字符
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // {
          //   min: 2,
          //   max: 10,
          //   message: "长度在 2 到 10 个字符",
          //   trigger: "change",
          // },

          { validator: validateTmName, trigger: "change" },

          // { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "change" },
        ],
        logoUrl: [
          // trigger: 'change' 对upload来说看不到这个效果，必须是整体验证的时候才能有验证的错误提示
          { required: true, message: "请上传logo图片", trigger: "change" },
        ],
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

    // 点击添加按钮
    showAddDialog() {
      (this.isShowDialog = true),
        (this.form = {
          tmName: "",
          logoUrl: "",
        });
    },

    // 点击修改按钮
    showUpdateDialog(row) {
      this.isShowDialog = true;
      //row是trademarkList里面的一个对象，用来展示在页面上的
      //我们把row的地址给了form一份   row和form就指向同一个对象，以后修改form就是在修改row,row改了，页面就会改
      // this.form = row
      // 这时候我们不能使用等号赋值的形式了，需要使用拷贝
      // form里都是基本数据类型，使用浅拷贝就可以了
      this.form = { ...row };
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
    addOrUpdateTrademark() {
      // 验证规则
      // valid：代表验证成功还是失败
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          // 验证成功才能有后续
          // 获取参数
          let trademark = this.form;
          // 整理参数 ===》最麻烦
          // 发请求
          const result = await this.$API.trademark.addOrUpdate(trademark);
          // 成功干啥
          if (result.code === 200) {
            //1、提示添加或者修改成功
            this.$message.success(`${trademark.id ? "修改" : "添加"}品牌成功`);
            //2、关闭dialog
            this.isShowDialog = false;
            //3、重新获取列表数据展示
            // （1）如果是添加我们默认是添加在最后一页，重新获取数据也是默认拿的是第一页
            // （2）但是修改重新获取数据也应该是获取修改的那一页的数据
            // 还是判断id是否存在，如果存在，把当前页码传进去，如果不存在，就默认把第一页传进去
            this.getTrademarkList(trademark.id ? this.page : 1);
          } else {
            // 失败干啥
            this.$message.error(`${trademark.id ? "修改" : "添加"}品牌失败`);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    deleteTrademark(row) {
      this.$confirm(`你确定删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const result = await this.$API.trademark.delete(row.id);
          this.getTrademarkList(
            this.trademarkList.length > 1 ? this.page : this.page - 1
          );
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message.info("取消删除");
        });
    },
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

