const SysLogsTemplate = `
<div>
    <el-row>
        <el-col>
            <el-form :v-model="queryAppsForm" :inline="true" size="small">
                 <el-form-item label="应用">
                    <el-select  @change="queryBranchId" v-model="queryAppsForm.appId" clearable placeholder="选择下发版本">
                      <el-option
                          v-for="item in apps"
                          :key="item.appId"
                          :label="item.appId"
                          :value="item.appId"
                        >
                    </el-select>
                 </el-form-item>

                  <el-form-item label="名称空间">
                     <el-select  @change="querySysLogsByBranchId"  v-model="queryAppsForm.branchId" clearable placeholder="选择下发版本">
                       <el-option
                           v-for="item in branches"
                           :key="item.branchId"
                           :label="item.branchId"
                           :value="item.branchId"
                         >
                     </el-select>
                  </el-form-item>
                   <el-form-item>
                     <el-input
                              v-model="queryAppsForm.propertyKey"
                              placeholder="请输入key"
                              @change="handleSearch"
                              @blur="handleSearch"
                              @keyup.native.enter="handleSearch">
                     </el-input>

                   </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="el-icon-search">查询</el-button>
                </el-form-item>
                    <el-form-item>
                         <el-button icon="el-icon-delete"  type="danger" @click="handleReset">重置</el-button>
                    </el-form-item>



            </el-form>
        </el-col>
    </el-row>
    <el-table :data="logs" v-loading="appsLoading" border stripe>
        <el-table-column prop="appId" label="应用id"></el-table-column>
        <el-table-column prop="branchId" label="名称空间"></el-table-column>
        <el-table-column prop="propertyKey" label="key"></el-table-column>
        <el-table-column prop="oldValue" label="旧值" show-overflow-tooltip></el-table-column>
        <el-table-column prop="newValue" label="新值" show-overflow-tooltip></el-table-column>
        <el-table-column
            prop="updateTime"
            label="更新时间"
            :formatter="formatUpdateTime">
        </el-table-column>
        <el-table-column prop="updatedBy" label="更新人"></el-table-column>
    </el-table>

    <el-row style="margin-top: 10px">
        <el-col style="text-align: end">
            <el-pagination :total="totalApps" :current-page.sync="queryAppsForm.pageNo" :page-size.sync="queryAppsForm.pageSize" @current-change="querySysLogs" layout="total,prev,pager,next" small background></el-pagination>
        </el-col>
    </el-row>
</div>
`;

const SysLogs = {
    template: SysLogsTemplate,
    data: function () {
        return {
            queryAppsForm: {
                pageNo: 1,
                pageSize: 20,
                propertyKey: null,
                appId: null,
                branchId: null,
                parent: null
            },

            appsLoading: false,
            totalApps: 0,
            apps: [],
            logs: [],
            branches:[],
            matchedApps: null,
            addAppDialogVisible: false,
            addAppForm: {
                appId: null,
                appName: null,
                parent: null
            }
        };
    },
    created: function () {
        this.querySysLogs();
        this.queryApps();

    },
    methods: {
        //格式化时间
        formatUpdateTime:function(row, column, cellValue) {
          if (!cellValue) return '';
          const date = new Date(cellValue);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },

        querySysLogs: function () {
            this.appsLoading = false;
            const theThis = this;
            this.doqueryLogs(this.queryAppsForm, function (result) {
                result.list.forEach(function (app) {
                    app.editing = false;
                    app.editingAppName = null;
                    app.editingParent = null;
                });
                theThis.totalApps = result.total;
                theThis.logs = result.list;
                theThis.appsLoading = false;
            }, function () {
                theThis.appsLoading = false;
            });
        },

         // 查询apps应用列表
           queryApps: function () {
               this.appsLoading = true;

               const theThis = this;
               this.doQueryApps(this.queryAppsForm, function (result) {
                   result.infos.forEach(function (app) {
                       app.editing = false;
                       app.editingAppName = null;
                       app.editingParent = null;
                       app.parentApp = null;

                   });
                   theThis.totalApps = result.totalCount;
                   theThis.apps = result.infos;
                   theThis.appsLoading = false;
               }, function () {
                   theThis.appsLoading = false;
               });
           },

          queryBranchId: function (appId) {
             this.querySysLogs();
               const theThis = this;
               axios.get('../manage/branch/findBranches', {
                   params: {
                       appId: appId,
                       profileId: 'master'
                   }
               }).then(function (result) {
                   if (!result.success) {
                       Vue.prototype.$message.error(result.message);
                   }
                   theThis.branches = result.branches;
               });
           },

          handleSearch:function(){
            this.querySysLogs();
          },
          handleReset:function(){
              this.queryAppsForm.propertyKey = null;
              this.queryAppsForm.appId = null;
              this.queryAppsForm.branchId = null;
              this.queryAppsForm.parent = null;
              this.querySysLogs();
          },

           querySysLogsByBranchId:function(){
               this.querySysLogs();
           },

        doqueryLogs: function (params, processResult, failCallback) {
            axios.get('../manage/sygLogs/findAll', {params: params})
                .then(function (result) {
                    if (result) {
                        processResult(result);
                    } else {
                        Vue.prototype.$message.error(result.message);
                        if (failCallback) {
                            failCallback(result);
                        }
                    }
                });
        },
          doQueryApps: function (params, processResult, failCallback) {
                axios.get('../manage/app/queryApps', {params: params})
                    .then(function (result) {
                        if (result.success) {
                            processResult(result);
                        } else {
                            Vue.prototype.$message.error(result.message);
                            if (failCallback) {
                                failCallback(result);
                            }
                        }
                    });
            },

    }
};