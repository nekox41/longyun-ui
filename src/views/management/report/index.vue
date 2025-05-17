<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="报告编号" prop="reportId">
        <el-input v-model="queryParams.reportId" placeholder="请输入报告编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="名称" prop="reportName">
        <el-input v-model="queryParams.reportName" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="报告类型" prop="reportType">
        <el-select v-model="queryParams.reportType" placeholder="请选择报告类型" clearable style="width: 80px;">
          <el-option v-for="dict in report_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="最终版本" prop="reportIsfinal">
        <el-select v-model="queryParams.reportIsfinal" placeholder="请选择最终版本" clearable style="width: 80px;">
          <el-option v-for="dict in report_isfinal" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="报告归属" prop="reportManager">
        <el-input v-model="queryParams.reportManager" placeholder="请输入报告归属" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['management:report:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['management:report:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['management:report:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['management:report:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reportList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="序号" align="center" prop="id" type="index" width="55px"/> -->
      <el-table-column label="报告编号" align="center" prop="reportId" />
      <el-table-column label="名称" align="center" prop="reportName" />
      <el-table-column label="项目面积" align="center" prop="reportArea" />
      <el-table-column label="报告类型" align="center" prop="reportType">
        <template #default="scope">
          <dict-tag :options="report_type" :value="scope.row.reportType" />
        </template>
      </el-table-column>
      <el-table-column label="最终版本" align="center" prop="reportIsfinal">
        <template #default="scope">
          <dict-tag :options="report_isfinal" :value="scope.row.reportIsfinal" />
        </template>
      </el-table-column>
      <el-table-column label="报告归属" align="center" prop="reportManager" />
      <el-table-column label="创建信息" align="center">
        <template #default="scope">
          <span>{{ scope.row.createBy }}</span>
          <br>
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新信息" align="center">
        <template #default="scope">
          <div v-if="scope.row.updateBy">
            <span>{{ scope.row.updateBy }}</span>
            <br>
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="报告文件" align="center" prop="reportFile">
        <template #default="scope">
          <el-button type="primary" @click="downloadFile(scope.row.reportFile)">下载</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['management:report:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['management:report:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改报告管理对话框 -->
    <el-dialog :title="title" v-model="open" width="60%" append-to-body>
      <el-form ref="reportRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报告编号" prop="reportId">
              <el-input v-model="form.reportId" placeholder="请输入报告编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报告类型" prop="reportType">
              <el-select v-model="form.reportType" placeholder="请选择报告类型">
                <el-option v-for="dict in report_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="reportName">
              <el-input v-model="form.reportName" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目面积" prop="reportArea">
              <el-input v-model="form.reportArea" placeholder="请输入项目面积" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报告归属" prop="reportManager">
              <el-input v-model="form.reportManager" placeholder="请输入报告归属" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最终版本" prop="reportIsfinal">
              <el-select v-model="form.reportIsfinal" placeholder="请选择最终版本" >
                <el-option v-for="dict in report_isfinal" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="报告文件" prop="reportFile">
          <reportUpload v-model="form.reportFile" :fileSize="1024" :fileType="['pdf', 'doc', 'docx', 'zip', 'rar']" :reportType="form.reportIsfinal"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Report">
import { listReport, getReport, delReport, addReport, updateReport } from "@/api/management/report";
import reportUpload from "./components/reportUpload.vue";
import download from "@/plugins/download";

const { proxy } = getCurrentInstance();
const { report_isfinal, report_type } = proxy.useDict('report_isfinal', 'report_type');

const reportList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    reportId: null,
    reportName: null,
    reportType: null,
    reportIsfinal: null,
    reportManager: null,
    reportArea: null,
    createBy: null,
    updateBy: null,
  },
  rules: {
    reportName: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
    reportFile: [
      { required: true, message: "报告文件不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const downloadFile = (filePath) => {
  download.resource(filePath);
};
/** 查询报告管理列表 */
function getList() {
  loading.value = true;
  listReport(queryParams.value).then(response => {
    reportList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    reportId: null,
    reportName: null,
    reportFile: null,
    reportType: null,
    reportIsfinal: null,
    reportManager: null,
    reportArea: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("reportRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "上传报告";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getReport(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["reportRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateReport(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addReport(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除报告管理编号为"' + _ids + '"的数据项？').then(function () {
    return delReport(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('management/report/export', {
    ...queryParams.value
  }, `report_${new Date().getTime()}.xlsx`)
}

getList();
</script>
