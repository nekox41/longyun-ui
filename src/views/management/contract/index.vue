<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="合同编号" prop="contractId">
        <el-input v-model="queryParams.contractId" placeholder="请输入合同编号" clearable @keyup.enter="handleQuery"
          style="width: 120px;" />
      </el-form-item>
      <el-form-item label="合同类型" prop="contractType">
        <el-select v-model="queryParams.contractType" placeholder="请选择合同类型" clearable style="width: 80px;">
          <el-option v-for="dict in contract_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同名称" prop="contractName">
        <el-input v-model="queryParams.contractName" placeholder="请输入合同名称" clearable @keyup.enter="handleQuery"
          style="width: 120px;" />
      </el-form-item>
      <el-form-item label="合同负责人" prop="manager" label-width="100px">
        <el-input v-model="queryParams.manager" placeholder="请输入合同负责人" clearable @keyup.enter="handleQuery"
          style="width: 120px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['management:contract:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['management:contract:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['management:contract:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['management:contract:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="contractList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="合同编号" align="center" prop="contractId" />
      <el-table-column label="合同类型" align="center" prop="contractType">
        <template #default="scope">
          <dict-tag :options="contract_type" :value="scope.row.contractType" />
        </template>
      </el-table-column>
      <el-table-column label="合同名称" align="center" prop="contractName" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合同负责人" align="center" prop="manager" />
      <el-table-column label="合同金额" align="center" prop="amount" />
      <el-table-column label="合同附件" align="center" prop="contractFile">
        <!-- ElButton + a 标签，打开窗口跳转到附件地址 -->
        <template #default="scope">
          <el-link :href="baseURL + '/' + scope.row.contractFile" target="_blank">查看</el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['management:contract:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['management:contract:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改合同管理对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="contractRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="合同编号" prop="contractId">
          <el-input v-model="form.contractId" />
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="form.contractType">
            <el-option v-for="dict in contract_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="form.contractName" placeholder="请输入合同名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker clearable v-model="form.startTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker clearable v-model="form.endTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择结束时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
          <el-form-item label="合同负责人" prop="manager">
            <el-input v-model="form.manager" placeholder="请输入合同负责人" />
          </el-form-item>
          <el-form-item label="合同金额" prop="amount">
            <el-input v-model="form.amount" placeholder="请输入合同金额" />
          </el-form-item>
          <el-form-item label="合同附件" prop="contractFile">
            <ContractUpload v-model="form.contractFile" :contractId="form.contractId" :contractName="form.contractName"
              :startTime="form.startTime" :endTime="form.endTime" :amount="form.amount" :manager="form.manager"
              :fileSize="100" />
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

<script setup name="Contract">
import { listContract, getContract, delContract, addContract, updateContract } from "@/api/management/contract";
import ContractUpload from "./components/contractUpload.vue";
const baseURL = import.meta.env.VITE_APP_BASE_API;

const { proxy } = getCurrentInstance();
const { contract_type } = proxy.useDict('contract_type');

const contractList = ref([]);
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
    contractId: null,
    contractType: null,
    contractName: null,
    manager: null,
  },
  rules: {
    contractId: [
      { required: true, message: "合同编号不能为空", trigger: "blur" }
    ],
    contractType: [
      { required: true, message: "合同类型不能为空", trigger: "change" }
    ],
    contractName: [
      { required: true, message: "合同名称不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "开始时间不能为空", trigger: "blur" }
    ],
    manager: [
      { required: true, message: "合同负责人不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "合同金额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询合同管理列表 */
function getList() {
  loading.value = true;
  listContract(queryParams.value).then(response => {
    contractList.value = response.rows;
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
    contractId: null,
    contractType: null,
    contractName: null,
    startTime: null,
    endTime: null,
    manager: null,
    amount: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    contractFile: null
  };
  proxy.resetForm("contractRef");
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
  title.value = "添加合同";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getContract(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改合同";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["contractRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateContract(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addContract(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除合同管理编号为"' + _ids + '"的数据项？').then(function () {
    return delContract(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('management/contract/export', {
    ...queryParams.value
  }, `contract_${new Date().getTime()}.xlsx`)
}

getList();
</script>
