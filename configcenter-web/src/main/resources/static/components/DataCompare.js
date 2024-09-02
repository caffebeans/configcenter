const DataCompareTemplate = `
<div>

<el-row>
  <!-- 第一行：应用1和分支1 -->
  <el-col :span="24">
    <el-form :model="sourceForm" :inline="true" size="small">
      <el-form-item label="应用">
        <el-select
          @change="handleApp1Change"
          v-model="sourceForm.appId"
          clearable
          placeholder="应用">
          <el-option
            v-for="item in apps"
            :key="item.appId"
            :label="item.appId"
            :value="item.appId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="环境">
        <el-select
          v-model="sourceForm.branchId"
          clearable
          placeholder="选择环境">
          <el-option
            v-for="item in sourceBranchList"
            :key="item.branchId"
            :label="item.branchId"
            :value="item.branchId">
          </el-option>
        </el-select>
      </el-form-item>
          <!-- 比对按钮 -->
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleCompareSearch(sourceForm.appId,sourceForm.branchId,'source')">查询</el-button>
          </el-form-item>
    </el-form>
  </el-col>
</el-row>

<el-row>
  <!-- 第二行：应用2和分支2 -->
  <el-col :span="24">
    <el-form :model="distForm" :inline="true" size="small">
      <el-form-item label="应用">
        <el-select
          v-model="distForm.appId"
          @change="handleApp2Change"
          clearable
          placeholder="应用">
          <el-option
            v-for="item in apps"
            :key="item.appId"
            :label="item.appId"
            :value="item.appId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="环境">
        <el-select
          v-model="distForm.branchId"
          clearable
          placeholder="选择环境">
          <el-option
            v-for="item in distBranchList"
            :key="item.branchId"
            :label="item.branchId"
            :value="item.branchId">
          </el-option>
        </el-select>

      </el-form-item>
         <el-form-item>
               <el-button type="primary" icon="el-icon-search" @click="handleCompareSearch(distForm.appId,distForm.branchId,'dist')">查询</el-button>
          </el-form-item>

    </el-form>
  </el-col>
</el-row>

<!--表格数据-->
    <el-row>
      <el-col :span="24">
        <el-form :model="queryAppsForm" :inline="true" size="small">
          <!-- 输入框 -->
          <el-form-item>
            <el-input
              v-model="queryAppsForm.propertyKey"
              placeholder="请输入key"
              @change="handleSearch"
              @blur="handleSearch"
              @keyup.native.enter="handleSearch">
            </el-input>
          </el-form-item>

          <!-- 比对按钮 -->
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleCompare">比对</el-button>
          </el-form-item>

          <!-- 重置按钮 -->
          <el-form-item>
            <el-button icon="el-icon-delete" type="danger" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-table :data="logs" v-loading="appsLoading" border stripe>
        <el-table-column prop="key" label="key值"></el-table-column>
        <el-table-column prop="sourceValue" label="名称空间1">
              <template slot-scope="scope">
                <el-popover trigger="hover" placement="top">
                  <p>姓名: {{ scope.row.name }}</p>
                  <p>住址: {{ scope.row.address }}</p>
                  <div slot="reference" class="name-wrapper">
                    <el-tag size="medium">{{ scope.row.name }}</el-tag>
                  </div>
                </el-popover>
              </template>
        </el-table-column>
        <el-table-column prop="distValue" label="名称空间2"></el-table-column>
    </el-table>

    <el-row style="margin-top: 10px">
        <el-col style="text-align: end">
            <el-pagination :total="totalApps" :current-page.sync="queryAppsForm.pageNo" :page-size.sync="queryAppsForm.pageSize" @current-change="querySysLogs" layout="total,prev,pager,next" small background></el-pagination>
        </el-col>
    </el-row>
</div>
`;

const DataCompare = {
    template: DataCompareTemplate,
    data: function () {
        return {
         columns: [
              { label: '应用id', prop: 'appId' },
              { label: '名称空间', prop: 'branchId' },
              { label: 'key', prop: 'propertyKey' },
              { label: '旧值', prop: 'oldValue' },
              { label: '新值', prop: 'newValue' },
              { label: '更新时间', prop: 'updateTime' },
              { label: '更新人', prop: 'updatedBy' }
            ],

          sourceForm: {
              pageNo: 1,
              pageSize: 20,
              propertyKey: null,
              appId: null,
              branchId: null,
              parent: null
          },
          distForm: {
              pageNo: 1,
              pageSize: 20,
              propertyKey: null,
              appId: null,
              branchId: null,
              parent: null
          },
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
            sourceBranchList:[],
            distBranchList:[],
            matchedApps: null,
        };
    },
    created: function () {
        this.querySysLogs();
        this.queryApps();

    },
    methods: {
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

        handleCompareSearch: function (appId, branchId,env) {

             const theThis = this;
             axios.get('../manage/dataCompare/findValues', {
                 params: {
                     appId: appId,
                     profileId: 'master',
                     branchId: branchId,
                     env:env
                 }
             }).then(function (result) {
                 if (!result) {
                     Vue.prototype.$message.error(result.message);
                 }
                 theThis.totalApps = result.total;
                 theThis.logs = result.list;
                 theThis.appsLoading = false;


             });

        },

        handleCompare: function () {
            this.appsLoading = false;
            const theThis = this;
            const params = {
              sourceAppId: this.sourceForm.appId,
              sourceBranchId: this.sourceForm.branchId,
              distAppId: this.distForm.appId,
              distBranchId: this.distForm.branchId
            }
            if (this.sourceForm.appId == this.distForm.appId && this.sourceForm.branchId == this.distForm.branchId) {
               alert("比对参数不能相同");
               return;
            }

            this.dohandleCompare(params, function (result) {
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

        queryDistBranchId: function(){
           this.queryDistBranchId(this.distForm.appId);
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

           handleApp1Change:function (appId) {

               this.querySourceBranchId(appId);
           },
           handleApp2Change:function (appId) {
               this.queryDistBranchId(appId);
           },

          queryBranchId: function (appId) {

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
          querySourceBranchId: function (appId) {

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

                      theThis.sourceBranchList = result.branches;
                  });
          },
         queryDistBranchId: function (appId) {
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
                     theThis.distBranchList = result.branches;
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

        dohandleCompare: function (params, processResult, failCallback) {
            console.log("params",params)
            axios.get('../manage/dataCompare/compare', {params: params})
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