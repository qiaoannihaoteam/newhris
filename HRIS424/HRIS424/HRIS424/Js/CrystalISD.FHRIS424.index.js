


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 Purpose      : FHRIS424 index

 Date         : 17 Jul 2018
 Author       : Eva Liao (ISD/CSC)
 Note         : 
 -------------------------------------------------
 17 Jul 2018	Eva Liao (ISD/CSC)	the first version

	the latest update: 17 Jul 2018 11:02
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

$(function () {
    // 初始化页面
    IndexPager.init();

    //初始化语言
    LangInit();
});

// 提供页面上的基本功能
var IndexPager = {
    _grid: $('#grid') || null,
    _gridData: null,
    _process: $(parent.document).find("#background,#progressBar"),
    _cover: $('#cover'),
    // 获取页面的URL
    pageUrl: 'View/FHRIS424.aspx?',
    // 查看Log页面的URL
    logUrl: 'view/ActionLogIndex.aspx?',
    // 批量编辑的URL
    EditAll: 'View/FHRIS424EditAll.aspx?',
    // 获取页面对应的API的URL
    apiUrl: '../View/Api/FHRIS424Api.ashx?',
    _gridColumns: [
                        {
                            field: "RID",
                            attributes: { align: "left" },
                            width:0,
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.RID", "CN:RID~EN:RID") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.RID", "CN:RID~EN:RID")
                        },
                        {
                            field: "Emp_No",
                            attributes: { align: "left" },
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Emp_No", "CN:工号~EN:Emp_No") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Emp_No", "CN:工号~EN:Emp_No")
                        },
                        {
                            field: "Emp_Name",
                            attributes: { align: "left" },
                            width: 120,
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Emp_Name", "CN:姓名~EN:Emp_Name") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Emp_Name", "CN:姓名~EN:Emp_Name")
                        },
                        {
                            field: "Sect",
                            attributes: { align: "left" },
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Sect", "CN:组织架构~EN:Sect") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Sect", "CN:组织架构~EN:Sect")
                        },


                        {
                            field: "Effect_Date",
                            format: "{0:dd MMM yyyy}",
                            attributes: { align: "left" },
                            width: 90,
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Effect_Date", "CN:生效日期~EN:Effect_Date") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Effect_Date", "CN:生效日期~EN:Effect_Date")
                        },
                        {
                            field: "Resgin_Date",
                            format: "{0:dd MMM yyyy}",
                            attributes: { align: "left" },
                            width: 90,
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Resgin_Date", "CN:离职日期~EN:Resgin_Date") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Resgin_Date", "CN:生效日期~EN:Resgin_Date")
                        },

                        {
                            field: "Position_Code",
                            attributes: { align: "left" },
                            width: 90,
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Position_Code", "CN:职位~EN:Position_Code") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Position_Code", "CN:职位~EN:Position_Code")
                        },
                        {
                            field: "customer_id",
                            attributes: { align: "left" },
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.customer_id", "CN:客户代码~EN:customer_id") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.customer_id", "CN:客户代码~EN:customer_id")
                        },
                        {
                            field: "customer_name",
                            attributes: { align: "left" },
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.customer_name", "CN:客户名称~EN:customer_name") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.customer_name", "CN:客户代码~EN:customer_name")
                        },

                        {
                            field: "Cost_Ratio",
                            attributes: { align: "left" },
                            width: 90,
                            headerTemplate: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Cost_Ratio", "CN:费用分配比率~EN:Cost_Ratio") + "</div>",
                            title: Language.GetText(FunctionID + "." + PageID + ".GridHeader.Cost_Ratio", "CN:费用分配比率~EN:Cost_Ratio")
                        }
    ],

    // 初始化页面
    init: function () {
        this.initKendoControls();
        this.resizeWindow();
        this.addHoverEffect();
        this.viewItemOnDblClick();
        this.gridClick();

        // // 重新计算Grid的高度
        this._grid.height($(document).height() - $('.pageContent').height());

        kendo.bind($("#container"), ViewModel);

        //隐藏页面上的Loading动画
        this._process.hide();

        // 延迟50ms再读取数据，避免阻塞，提高用户体验
        setTimeout(function () {
            ViewModel.search();
        }, 50);
    },

    // 初始化Kendo控件
    initKendoControls: function () {
        this._gridData = this._grid.kendoGrid({
            selectable: "row",
            allowCopy: true,
            columns: this._gridColumns,
            dataSource: [],
            groupable: {
                messages: {
                    empty: Language.GetText(FunctionID + "." + PageID + ".GroupTooltips", "CN:将列名拖至此处将会进行分组显示。~EN:Draw the columns to here will grouping.")
                    //empty: "Draw the columns to here will grouping."
                }
            },
            sortable: {
                mode: "multiple"
            },
            excel: {
                allPages: true,
                fileName: Language.GetText(FunctionID + "." + PageID + ".ExcelFileName", "CN:~EN:") + ".xlsx"
            },
            pageable: {
                pageSizes: [10, 15, 20, "all"],
                buttonCount: 5
            }
        }).data('kendoGrid');

        // 初始化Search条件的输入框
        $("#txt_Emp_No").kendoMaskedTextBox();
        this.makeDateControlForSearch("txt_Effect_DateFrom", "txt_Effect_DateTo");
        
        $("#txt_ActiveVal").initKendoCombobox({
            dataSource: [
                { text: '在职',code:'True' },
                { text: '离职', code: 'False' },
                { text: '全部', code: '' }
            ],            
            enable:this.enable

        });

        //button
        $(".item > button").kendoButton();
    },


    //日期控制
    //-----------------------------------------------------------------------------------------------

    resetDateControl: function (dateFrom, dateEnd) {
        dateFrom.min(new Date("1900-01-01"));
        dateFrom.max(new Date("2099-12-31"));
        dateEnd.min(new Date("1900-01-01"));
        dateEnd.max(new Date("2099-12-31"));
    },

    dateControlChange: function (fromId, toId, flag) {
        var dateFrom = $("#" + fromId).data("kendoDatePicker");
        var dateEnd = $("#" + toId).data("kendoDatePicker");
        var startDate = dateFrom.value();
        var endDate = dateEnd.value();
        if (flag == "from") {
            if (startDate) {
                startDate = new Date(startDate);
                startDate.setDate(startDate.getDate());
                dateEnd.min(startDate);
            } else if (endDate) {
                dateFrom.max(new Date(endDate));
            } else {
                this.resetDateControl(dateFrom, dateEnd);
            }
        } else {
            if (endDate) {
                endDate = new Date(endDate);
                endDate.setDate(endDate.getDate());
                dateFrom.max(endDate);
            } else if (startDate) {
                dateEnd.min(new Date(startDate));
            } else {
                this.resetDateControl(dateFrom, dateEnd);
            }
        }

    },


    //------------------------------------------------------------------------------------

    //生成区间日期控件
    makeDateControlForSearch: function (fromId, toId) {
        var dateFrom = $("#" + fromId).kendoDatePicker({
            format: "dd MMM yyyy",
            parseFormats: ["yyyy-MM-dd"]
        }).data("kendoDatePicker");

        var dateEnd = $("#" + toId).kendoDatePicker({
            format: "dd MMM yyyy",
            parseFormats: ["yyyy-MM-dd"]
        }).data("kendoDatePicker");

        dateFrom.max(dateEnd.value());
        dateEnd.min(dateFrom.value());

        $("#" + fromId).change(function () {
            var datepicker = $("#" + fromId).data("kendoDatePicker");
            var value = new Date(this.value);
            datepicker.value(value);
            IndexPager.dateControlChange(fromId, toId, "from");
        });
        $("#" + toId).change(function () {
            var datepicker = $("#" + toId).data("kendoDatePicker");
            var value = new Date(this.value);
            datepicker.value(value);
            IndexPager.dateControlChange(fromId, toId, "to");
        });
    },


    //根据窗口改变而重新设置大小
    resizeWindow: function () {
        var grid = this._grid;

        $(window).on("resize", function () {
            grid.height($(document).height() - $('.pageContent').height());
            kendo.resize(grid);
        });
    },

    // 是否显示按钮（取决于是否选中行）
    isShowButtons: function (isShow) {
        var buttons = $("#btnDelete, #btnEdit, #btnView, #btnCopy").parent();
        isShow ? buttons.show() : buttons.hide();
    },

    // 给button添加hover效果
    addHoverEffect: function () {
        $(".toolBar > li").addHoverClass();
    },

    // 双击鼠标查看Item
    viewItemOnDblClick: function () {
        this._grid.on("dblclick", "tr.k-state-selected", function () {
            IndexPager.openPage(true, "View", IndexPager.pageUrl + "action=view&key=", Language.GetText(FunctionID + "." + PageID + ".ViewAction", "CN:_查看~EN:_View"));
        });
    },

    // 检查是否选中Item
    isSelectedItem: function () {
        var items = this._gridData.select().length;

        if (items > 0) {
            return true;
        } else {
            $.showNotification(Language.GetText(FunctionID + "." + PageID + ".SelectTips", "CN:请先选择一条选项。~EN:Please select a row at least."), "error");
            return false;
        }
    },

    // 获取数据源
    getDataSource: function (action) {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: IndexPager.apiUrl + "action=" + action,
                    dataType: "json",
                    cache: false
                }
            }
        });
    },

    // 新开一个Tab页面
    openPage: function (isValidateSelect, pageId, url, pageTitle) {
        var itemData = IndexPager._gridData.dataItem(IndexPager._gridData.select());

        if (!isValidateSelect || IndexPager.isSelectedItem()) {
            IndexPager._process.show();

            // itemData.RID 是该数据项的唯一标识
            parent.OpenTabJS(PageID + "_" + pageId, url + $.trim(itemData.RID) + "&ver=" + kendo.guid(), pageTitle);
        }
    },

    // grid中的单击行事件
    gridClick: function () {
        this._grid.on("click", "tr.k-state-selected", function () {
            IndexPager.isShowButtons(true);
        });
    }
},

    // 主要用于实现交互
    ViewModel = kendo.observable({
        conditionModel: {},

        // 搜索
        search: function () {
            $.showCover();

            $.ajax({
                type: "post",
                url: IndexPager.apiUrl + 'action=Search',
                data: { model: JSON.stringify(ViewModel.conditionModel) },
                dataType: "json",
                success: function (result) {
                    $.hideCover();

                    if (result.IsSuccess) {
                        var dataSource = new kendo.data.DataSource({
                            data: result.Data,
                            schema: {
                                model: {
                                    fields: {

                                        Effect_Date: {
                                            type: "Date"
                                        },

                                        aaa: {
                                            type: "date"
                                        }
                                    }
                                }
                            },
                            pageSize: 15
                        });
                        var grid = $('#grid').data("kendoGrid");

                        grid.setDataSource(dataSource);
                        IndexPager.isShowButtons(false);
                    }
                },
                error: function () {
                    $.hideCover();
                    console.error('ajax error: search request failed, pls check.');
                }
            });
        },

        // 刷新
        refreshGrid: function () {
            this.search();
        },

        // 创建
        create: function () {
            IndexPager._process.show();
            parent.OpenTabJS(PageID + "_Create", IndexPager.pageUrl + "action=add&key=" + kendo.guid(), Language.GetText(FunctionID + "." + PageID + ".CreateAction", "CN:_创建~EN:_Create"));
        },

        // 复制
        copyToNew: function () {
            IndexPager.openPage(true, "CopyToNew", IndexPager.pageUrl + "action=copytonew&key=", Language.GetText(FunctionID + "." + PageID + ".CopyAction", "CN:_复制~EN:_Copy"));
        },

        // 查看
        view: function () {
            IndexPager.openPage(true, "View", IndexPager.pageUrl + "action=view&key=", Language.GetText(FunctionID + "." + PageID + ".ViewAction", "CN:_查看~EN:_View"));
        },

        // 查看Log
        viewLog: function () {
            var url = kendo.format("{0}FunctionID={1}&table={2}&action={3}", IndexPager.logUrl, FunctionID, "Cost_Per_Log", "view");
            var title = Language.GetText(FunctionID + "." + PageID + ".ViewAction", "CN:_日志~EN:_Log");
            var items = IndexPager._gridData.select().length;
            if (items > 0) {
                IndexPager.openPage(true, "View", url + "&ShowType=current&RID=", title);
            } else {
                parent.OpenTabJS(PageID + "_View", url + "&ShowType=all&RID=&ver=" + kendo.guid(), title);
            }
        },

        // 编辑
        edit: function () {
            IndexPager.openPage(true, "Edit", IndexPager.pageUrl + "action=edit&key=", Language.GetText(FunctionID + "." + PageID + ".EditAction", "CN:_编辑~EN:_Edit"));
        },

        // 批量编辑
        editAll: function () {
            parent.OpenTabJS(PageID + "_EditAll", IndexPager.EditAll + "ver=" + kendo.guid(), "FHRIS424_EditAll");
        },

        // 删除
        delete0: function () {
            if (IndexPager.isSelectedItem() && confirm(Language.GetText(FunctionID + "." + PageID + ".DeleteTips", "CN:确定删除该行数据吗？~EN:Are you sure to delete this item?"))) {
                var rid = IndexPager._gridData.dataItem(IndexPager._gridData.select()).RID;

                $.showCover();

                $.ajax({
                    type: "post",
                    url: IndexPager.apiUrl + 'action=Delete&key=' + rid,
                    dataType: "json",
                    success: function (result) {
                        $.hideCover();

                        if (result.IsSuccess) {
                            $('#btnRefresh').trigger('click');
                            $.showNotification(Language.GetText(FunctionID + "." + PageID + ".DeleteResult", "CN:刪除成功~EN:Deleted success"), "success");
                            //$.showNotification("Deleted success", "success");
                        } else {
                            $.showNotification(result.Message, "error");
                        }
                    },
                    error: function () {
                        $.hideCover();
                        console.error('ajax error: delete request failed, pls check.');
                    }
                });
            }
        },

        // 清空条件
        clearCondition: function () {
            for (var condition in this.conditionModel.toJSON()) {
                this.conditionModel.set(condition, '');
            }
        },

        // 切换搜索的显示
        toggleSearch: function () {
            var grid = $("#grid"),
                gridContent = $("#grid > .k-grid-content");

            $(".panelContent").slideToggle("slow", function () {
                //计算Grid的高度
                var height = $('#container').height() - $(".pageContent").height() - 4;
                grid.css("height", height);
                gridContent.css("height", height - 115);
            });
            $(".panelHeaderContent > h1 > span.k-icon").toggle();
        },

        // 导出Excel
        exportExcel: function () {
            $('#grid').data("kendoGrid").saveAsExcel();
        }

    });