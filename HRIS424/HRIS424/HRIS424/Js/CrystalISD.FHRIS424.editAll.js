


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 Purpose      : FHRIS424 editAll

 Date         : 17 Jul 2018
 Author       : Eva Liao (ISD/CSC)
 Note         : 
 -------------------------------------------------
 17 Jul 2018	Eva Liao (ISD/CSC)	the first version

	the latest update: 17 Jul 2018 11:02
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

$(function() {
setConstraintToField();
});

//数据源
var dataSource;

//数据是否已改变
var isDataChanged = false;
var gridEdited = false;
var isDeleteNewRow = false;
//获取index页面的查询条件
var condition0 = $.getDataFromIndex('FHRIS424Index.aspx', 'ViewModel').conditionModel;
//存储删除的记录
var deleteArray = [];

//字段长度
				var Emp_NoMaxSize; 
				var Effect_DateMaxSize; 
				var Customer_idMaxSize; 
				var Cost_RatioMaxSize; 

// 通过后台返回的信息，给输入框加上长度限制
function setConstraintToField() {
    $.ajax({
        type: "get",
		url: "../View/Api/FHRIS424Api.ashx?action=GetFHRIS424ValidationDefine",
        dataType: "json",
        success: function (result) {
			for (var i = 0; i < result.length; i++) {
			var m = result[i];
			switch(m.ColumnName){
							case "Emp_No":
							Emp_NoMaxSize = m.ColumnSize;
							break;
							 
							case "Effect_Date":
							Effect_DateMaxSize = m.ColumnSize;
							break;
							 
							case "Customer_id":
							Customer_idMaxSize = m.ColumnSize;
							break;
							 
							case "Cost_Ratio":
							Cost_RatioMaxSize = m.ColumnSize;
							break;
							 
			}
		}
            // 初始化页面
            IndexPager.init();

            //初始化语言
            LangInit();
        },
        error: function () {
            console.error('ajax error: setMaxLengthToField request failed, pls check.');
        }
    });
}
		
// 提供页面上的基本功能
var IndexPager = {
        _grid: $('#grid') || null,
        _gridData: null,
        _process: $(parent.document).find("#background,#progressBar"),
        _cover: $('#cover'),
        // 获取页面对应的API的URL
        apiUrl: '../View/Api/FHRIS424Api.ashx?',
        _gridColumns: [
		        {
            title: "<div style='text-align:center'>Select</div>",
            template: '<input id="ischange" class="checkbox" type="checkbox"/>',
            width: "50px",
            attributes: {
                "class": "unSelect"
            },
            editor: function () {
                if ($.browser.msie) {
                    $('input:checkbox').click(function () {
                        this.blur();
                        this.focus();
                    });
                };
            }
        },
			    {
                field: "Emp_No",
				editor: function (container, options, dataItem) {
                    var input = $('<input maxLength="' + Emp_NoMaxSize + '" class="k-textbox" autocomplete="true"/>');
                    input.attr("name", options.field);
                    input.appendTo(container);
                    //input.attr('disabled', 'true');
					$(container).unbind("keydown");
                    $(container).unbind("keyup");
                    $(container).on("keyup", function (e) {
                        if (e.keyCode == 9 || e.keyCode == 13) {
                            options.model.set("Emp_No", $(this).find("input:visible").val());
                            IndexPager.nextCell();
                            return false;
                        }
                    });
                },
                attributes: {
                    align: "left"
                },
			
                title: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Emp_No", "CN:工号~EN:Emp_No") + "</div>"
            }, 
			    {
                field: "Effect_Date",
				editor: function (container, options, dataItem) {
                    var input = $('<input maxLength="' + Effect_DateMaxSize + '" class="k-textbox" autocomplete="true"/>');
                    input.attr("name", options.field);
                    input.appendTo(container);
                    //input.attr('disabled', 'true');
					$(container).unbind("keydown");
                    $(container).unbind("keyup");
                    $(container).on("keyup", function (e) {
                        if (e.keyCode == 9 || e.keyCode == 13) {
                            options.model.set("Effect_Date", $(this).find("input:visible").val());
                            IndexPager.nextCell();
                            return false;
                        }
                    });
                },
                attributes: {
                    align: "left"
                },
			
                title: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Effect_Date", "CN:生效日期~EN:Effect_Date") + "</div>"
            }, 
			    {
                field: "Customer_id",
				editor: function (container, options, dataItem) {
                    var input = $('<input maxLength="' + Customer_idMaxSize + '" class="k-textbox" autocomplete="true"/>');
                    input.attr("name", options.field);
                    input.appendTo(container);
                    //input.attr('disabled', 'true');
					$(container).unbind("keydown");
                    $(container).unbind("keyup");
                    $(container).on("keyup", function (e) {
                        if (e.keyCode == 9 || e.keyCode == 13) {
                            options.model.set("Customer_id", $(this).find("input:visible").val());
                            IndexPager.nextCell();
                            return false;
                        }
                    });
                },
                attributes: {
                    align: "left"
                },
			
                title: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Customer_id", "CN:客户代码~EN:Customer_id") + "</div>"
            }, 
			    {
                field: "Cost_Ratio",
				editor: function (container, options, dataItem) {
                    var input = $('<input maxLength="' + Cost_RatioMaxSize + '" class="k-textbox" autocomplete="true"/>');
                    input.attr("name", options.field);
                    input.appendTo(container);
                    //input.attr('disabled', 'true');
					$(container).unbind("keydown");
                    $(container).unbind("keyup");
                    $(container).on("keyup", function (e) {
                        if (e.keyCode == 9 || e.keyCode == 13) {
                            options.model.set("Cost_Ratio", $(this).find("input:visible").val());
                            IndexPager.nextCell();
                            return false;
                        }
                    });
                },
                attributes: {
                    align: "left"
                },
			
                title: "<div style='text-align:left'>" + Language.GetText(FunctionID + "." + PageID + ".GridHeader.Cost_Ratio", "CN:费用分配比率~EN:Cost_Ratio") + "</div>"
            } 
        ],

        // 初始化页面
        init: function () {
            this.initKendoControls();
            this.resizeWindow();
            this.addHoverEffect();

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
        initKendoControls: function() {
            this._gridData = this._grid.kendoGrid({
                selectable: false,
                allowCopy: true,
                columns: this._gridColumns,
                dataSource: [],
                groupable: {
                    messages: {
                        empty: Language.GetText(FunctionID + "." + PageID + ".GroupTooltips", "CN:將列名拖至此處將會進行分組顯示.~EN:Draw the columns to here will grouping.")
                    }
                },
				            editable: true,
            edit: function (e) {
                gridEdited = true;
				                //对输入框中的内容进行全选
                setTimeout(function () {
                    e.container.find("input").focus();
                }, 100);
            },
            dataBound: function () {
                $(".checkbox").bind("change", function (e) {
                    $(e.target).closest("tr").toggleClass("k-state-selected");
                });
            },
                sortable: true,
                pageable: {
                    pageSizes: [10, 15, 20, "all"],
                    buttonCount: 5
                }
            }).data('kendoGrid');

        //禁止grid内触发原生的enter和tab事件
        $("#grid table").on("keydown", "td", function (e) {
            return !(e.keyCode == 9 || e.keyCode == 13);
        });
        //grid内的按键操作
        $("#grid table").on("keyup", "td", function (e) {
            var grid = $("#grid").data("kendoGrid"),
            nextCell = null;
            if (e.keyCode == 13 || e.keyCode == 9) { //Enter或Tab
                var tblCells = grid.content.find("td:not(.unSelect)");
                var index = tblCells.index(grid.content.find("td.k-edit-cell"));
                if (tblCells[index + 1]) {
                    nextCell = tblCells[index + 1];
                    grid.editCell(nextCell);
                }
                return false;
            }
        });

        //编辑时全选输入框的内容
        $("#grid table").on("focus", "td", function (e) {
            $(this).find("input").select();
        });
		
            //button
            $(".item > button").kendoButton();
        },


        //根据窗口改变而重新设置大小
        resizeWindow: function() {
            var grid = this._grid;

            $(window).on("resize", function() {
                grid.height($(document).height() - $('.pageContent').height());
                kendo.resize(grid);
            });
        },

        // 给button添加hover效果
        addHoverEffect: function() {
            $(".toolBar > li").addHoverClass();
        },

        // 获取数据源
        getDataSource: function(action) {
            return new kendo.data.DataSource({
                transport: {
                    read: {
                        url: IndexPager.apiUrl + "action=" + action,
                        dataType: "json",
                        cache: false
                    }
                }
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
                data: { model: JSON.stringify(condition0) },
                dataType: "json",
                success: function (result) {
                    $.hideCover();

                    if (result.IsSuccess) {
                        dataSource = new kendo.data.DataSource({ 
                            data: result.Data, 
                            schema: {
                                model: {
                                    fields: {
                                        birth_Date: {
                                            type: "date"
                                        }
                                    }
                                }
                            },
							                            change: function (e) {
                                if (!isDeleteNewRow && gridEdited) {
                                    isDataChanged = true;
                                }
                            },
                            pageSize: 15 
                        });
                        var grid = $('#grid').data("kendoGrid");
                        grid.setDataSource(dataSource);
                        deleteArray = [];
                        gridEdited = false;
                        isDataChanged = false;
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

        // 退出
        exit: function () {
            if (isDataChanged) {
                //                var exitTips = Language.GetText(FunctionID + "." + PageID + ".exit", "CN:數據尚未保存，是否確認退出？~EN:Are you sure to exit without saving?");
                var exitTips = "Are you sure to exit without saving?";
                confirm(exitTips) && parent.navTab.closeCurrentTab();
            } else {
                parent.navTab.closeCurrentTab();
            }
        },
		
		        //新增
        add: function () {
            grid = $('#grid').data("kendoGrid");
            grid.addRow();
			        },
		

        //复制
        copyToNew: function () {
            var selectRows = $(".k-state-selected");
            if (selectRows.length - 2 > 0) {//这里不一定是2，得根据实际页面来看
                var grid = $("#grid").data("kendoGrid");
                var dataItem0;
                var indexArray = []; //因为每改变一次dataSource，原先选择的记录在dataSource里面的位置都会发生变化，故需先记录选择的记录的初始位置
                for (var i = 0; i < selectRows.length; i++) {
                    dataItem0 = grid.dataItem(selectRows[i]);
                    if (dataItem0) {
                        indexArray.push(dataSource.indexOf(dataItem0));
                    }
                }
                for (var i = 0; i < indexArray.length; i++) {
                    dataItem0 = dataSource.at(indexArray[i] + i);
                    dataSource.insert(0, { 
            RID:dataItem0.RID, 
            Sect_RID:dataItem0.Sect_RID, 
            Emp_No:dataItem0.Emp_No, 
            Effect_Date:dataItem0.Effect_Date, 
            Customer_id:dataItem0.Customer_id, 
            Cost_Ratio:dataItem0.Cost_Ratio 
					});
                    dataSource.data()[0].RID = "";
			                }
            } else {
                //                $.showNotification(Language.GetText(FunctionID + "." + PageID + ".SelectTips", "CN:請先選擇一條選項.~EN:Please select a row at least."), "error");
                $.showNotification("Please select a row at least.", "error");
            }
        },

          //删除
        delete0: function () {
            var selectRows = $("#grid tr.k-state-selected")
            if (selectRows.length > 0) {
                var grid = $("#grid").data("kendoGrid");
                var dataItem0;
                var indexArray = []; //因为每改变一次dataSource，原先选择的记录在dataSource里面的位置都会发生变化，故需先记录选择的记录的初始位置
                isDeleteNewRow = true;
                for (var i = 0; i < selectRows.length; i++) {
                    dataItem0 = grid.dataItem(selectRows[i]);
                    if (dataItem0) {
                        indexArray.push(dataSource.indexOf(dataItem0));
                        if (dataItem0.RID) {
                            isDeleteNewRow = false;
                        }

                    }
                }
                for (var i = 0; i < indexArray.length; i++) {
                    dataItem0 = dataSource.at(indexArray[i] - i);
                    dataSource.remove(dataItem0);
                    if (dataItem0.RID) {//如果是刚刚新增的记录未保存是没有RID的，不用传给后台
                        deleteArray.push(dataItem0.RID);
                    }
                }
            } else {
                //                $.showNotification(Language.GetText(FunctionID + "." + PageID + ".SelectTips", "CN:請先選擇一條選項.~EN:Please select a row at least."), "error");
                $.showNotification("Please select a row at least.", "error");
            }

        },

        //保存
        save: function () {
            $.showCover();
            var saveable = true;
            var CostPerList = dataSource.data();
            var date = null;
			/*若出现"&amp;"，用"&"替换*/
            for (var i = 0; i < CostPerList.length; i++) {
			if(!(CostPerList[i].Emp_No && CostPerList[i].Effect_Date && CostPerList[i].Customer_id && CostPerList[i].Cost_Ratio ))
  {
                    $.showNotification("Data can not be empty!\nAt row" + (i + 1), 'error');
                    $.hideCover();
                    return 0;
                }
				
						            }
            ViewModel.set("CostPerList", CostPerList);
            ViewModel.set("DeleteList", deleteArray);
            $.ajax({
                type: "post",
                dataType: "json",
                url: "../View/Api/FHRIS424Api.ashx?action=UpdataAll",
                data: {
                    model: JSON.stringify(ViewModel)
                },
                success: function (result) {
                    $.hideCover();
                    if (result.IsSuccess) {
                        //                        $.showNotification(Language.GetText(FunctionID + "." + PageID + ".Save", "CN:保存成功.~EN:Save successful."), "success");
                        $.showNotification("Save successful.", "success");
						deleteArray = [];
                        gridEdited = false;
                        isDataChanged = false;
                        $.refreshIndex('FHRIS424Index.aspx', 'btnRefresh'); //刷新index页面
                    } else {
                        $.showNotification(result.Message, 'error');
                    }
                },
                error: function () {
                    console.error('ajax error: save request failed, pls check.');
                }
            });

        }

    });