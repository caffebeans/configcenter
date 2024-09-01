// 应用管理组件
const SysLogsTemplate = `
<div>
    <el-row>
        <el-col>
            <el-form :v-model="queryAppsForm" :inline="true" size="small">
                <el-form-item>
                    <el-input v-model="queryAppsForm.appId" clearable placeholder="应用id"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="queryAppsForm.parent" clearable placeholder="名称空间"></el-input>
                </el-form-item>
                   <el-form-item>
                        <el-input v-model="queryAppsForm.parent" clearable placeholder="key值"></el-input>
                   </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="queryApps">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
    <el-table :data="apps" v-loading="appsLoading" border stripe>
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
            <el-pagination :total="totalApps" :current-page.sync="queryAppsForm.pageNo" :page-size.sync="queryAppsForm.pageSize" @current-change="queryApps" layout="total,prev,pager,next" small background></el-pagination>
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
                pageSize: 10,
                appId: null,
                branchId: null,
                parent: null
            },
            appsLoading: false,
            totalApps: 0,
            apps: [],
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

        queryApps: function () {
            this.appsLoading = false;
            const theThis = this;
            this.doQueryApps(this.queryAppsForm, function (result) {
                result.list.forEach(function (app) {
                    app.editing = false;
                    app.editingAppName = null;
                    app.editingParent = null;
                });
                theThis.totalApps = result.total;
                theThis.apps = result.list;
                theThis.appsLoading = false;
            }, function () {
                theThis.appsLoading = false;
            });
        },
        queryMatchedApps: function (appId) {
            const theThis = this;
            this.doQueryApps({
                pageNo: 1,
                pageSize: 100,
                appId: appId
            }, function (result) {
                theThis.matchedApps = result.infos;
            });
        },
        startEditing: function (app) {
            app.editing = true;
            app.editingAppName = app.appName;
            app.editingParent = app.parent;
            this.matchedApps = null;
        },
        saveEditing: function (app) {
            const theThis = this;
            Vue.prototype.$confirm('确定保存修改？', '警告', {type: 'warning'})
                .then(function () {
                    theThis.doAddOrModifyApp({
                        appId: app.appId,
                        appName: app.editingAppName,
                        parent: app.editingParent
                    }, function () {
                        app.editing = false;
                        app.appName = app.editingAppName;
                        app.parent = app.editingParent;
                        app.parentApp = null;
                        if (app.parent) {
                            theThis.doFindApp(app.parent, function (parentApp) {
                                app.parentApp = parentApp;
                            });
                        }
                    });
                });
        },
        deleteApp: function (app) {
            const theThis = this;
            Vue.prototype.$confirm('确定删除应用？', '警告', {type: 'warning'})
                .then(function () {
                    axios.post('../manage/app/deleteApp', {appId: app.appId})
                        .then(function (result) {
                            if (!result.success) {
                                Vue.prototype.$message.error(result.message);
                                return;
                            }
                            Vue.prototype.$message.success(result.message);
                            theThis.queryApps();
                        });
                });
        },
        addApp: function () {
            const theThis = this;
            this.$refs.addAppForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                theThis.doAddOrModifyApp(theThis.addAppForm, function () {
                    theThis.closeAddAppDialog();
                    theThis.queryApps();
                });
            })
        },
        closeAddAppDialog: function () {
            this.addAppDialogVisible = false;
            this.addAppForm.appId = null;
            this.addAppForm.appName = null;
            this.addAppForm.parent = null;
        },
        toShowingApp: function (app) {
            if (!app) {
                return '';
            }
            let text = app.appId;
            if (app.appName) {
                text += '（' + app.appName + '）';
            }
            return text;
        },
        doQueryApps: function (params, processResult, failCallback) {
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
        doFindApp: function (appId, processApp) {
            axios.get('../manage/app/findApp', {
                params: {
                    appId: appId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                processApp(result.app);
            });
        },
        doAddOrModifyApp: function (params, successCallback) {
            axios.post('../manage/app/addOrModifyApp', params)
                .then(function (result) {
                    if (!result.success) {
                        Vue.prototype.$message.error(result.message);
                        return;
                    }
                    Vue.prototype.$message.success(result.message);
                    successCallback();
                });
        }
    }
};