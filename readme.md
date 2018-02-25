#select选择面板

**支持多选、筛选、清空、联动等

**说明**

1. 依赖：jquery、bootstrp、jsrender(模板引擎)

**使用**

1. 引入jQuery
2. 引入select_panel.js及select_panel.css
3. 在select_pannel.js中设置
```javascript
    // 设置请求按钮显示文字及请求参数及联动关系
    btnData: [ // children:子级往下，直至底级子级  parent:父级往上，直至顶级父级
        [
            {key: 'source', title: '交易市场'},
            {key: 'advertiser', title: '广告主', children: 'campaign, adgroup, creative'},
            {key: 'campaign', title: '推广计划', parent: 'advertiser', children: 'adgroup, creative'},
            {key: 'adgroup', title: '广告', parent: 'campaign, advertiser', children: 'creative'},
            {key: 'creative', title: '创意', parent: 'adgroup, campaign, advertiser'}
        ],
        [
            {key: 'media', title: '媒体'},
            {key: 'adunit', title: '广告位'},
            {key: 'size', title: '尺寸'},
            {key: 'ad_type', title: '广告形式'},
        ]
    ],


    // 渲染按钮, 设置按钮颜色
    renderBtn: function () {
        var tp = $('#tp_search_btn'),
            data = searchMod.data.btnData;
        $('#search .item.red').html(tp.render({data:data[0], color: 'primary'}));
        $('#search .item.blue').html(tp.render({data:data[1], color: 'info'}));
    },
```
4. 调用
```javascript
    // 调用
    $('#query').click(function () {
      console.log('data', searchMod.searchData);
    })
    // 打印数据为
    {
        adgroup: [],
        advertiser: ['100023'],
        campaign: ['100453']
    }
```

**效果**

![效果图](https://raw.githubusercontent.com/ESnail/select_panel/master/demo.gif)