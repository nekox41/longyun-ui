<template>
    <el-dialog :model-value="visible" @close="handleClose" title="批量上传">
      <el-upload
        drag
        :action="uploadFileUrl"
        :data="{ isFinal: true }"
        multiple
        :file-list="form.list"
        :on-success="handleSuccess"
        :on-remove="handleRemove"
        :headers="headers"
        :before-upload="beforeUpload"
      >
        <div class="el-upload__text">
          拖动文件到此区域或者 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请自行压缩为 zip/rar 格式上传，且每个文件不能超过 1024MB。
          </div>
        </template>
      </el-upload>
  
      <el-form id="batch-add-form" label-width="80px">
        <div v-for="(item, index) in form.list" :key="index" style="margin-bottom: 20px;">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item label="报告编号">
                <el-input v-model="item.reportId" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="名称">
                <el-input v-model="item.reportName" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="类型">
                <el-select v-model="item.reportType" placeholder="请选择">
                  <el-option v-for="dict in report_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">提 交</el-button>
        </div>
      </template>
    </el-dialog>
  </template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { getToken } from "@/utils/auth";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/management/report/upload");
const headers = ref({ Authorization: "Bearer " + getToken() });
const emit = defineEmits(['update:visible', 'submit']);

const { proxy } = getCurrentInstance();
const { report_type } = proxy.useDict('report_type');

const form = ref({
  list: []
});

// ✅ 文件上传前验证
function beforeUpload(file) {
  const isValidType = ['application/zip', 'application/x-rar-compressed'].includes(file.type);
  const isValidSize = file.size / 1024 / 1024 <= 1024; // 小于等于 1024 MB

  if (!isValidType) {
    proxy.$modal.msgError('只能上传 zip 或 rar 文件');
    return false;
  }

  if (!isValidSize) {
    proxy.$modal.msgError('文件大小不能超过 1024MB');
    return false;
  }

  return true;
}

// ✅ 上传成功后更新表单数据
function handleSuccess(response, file) {
  form.value.list.push({
    reportFile: response.fileName,
    reportId: '',
    reportName: response.newFileName.split("_")[0],
    reportType: 'JC',
    reportIsfinal: 'Y'
  });
}

function handleRemove(file) {
  const index = form.value.list.findIndex(item => item.uid === file.uid);
  if (index > -1) {
    form.value.list.splice(index, 1);
  }
}

function handleClose() {
  emit('update:visible', false);
}

function handleSubmit() {
  emit('submit', form.value.list);
}
</script>