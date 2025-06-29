const BASE_GUILD_URL = 'https://docs.mktlogin.com/rpa-flows/';

export const flowchartOptions = [
  {
    alias: 'start_node',
    name: 'Start',
    icon: 'solar:play-bold',
  },
  {
    id: 0,
    name: 'Ghim',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
    options: [],
  },
  {
    id: 13,
    name: 'Chung',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 14,
    name: 'Trình duyệt',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 15,
    name: 'Tương tác Web',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 16,
    name: 'Dữ liệu',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 17,
    name: 'Luồng điều khiển',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 18,
    name: 'Xử lý tệp & thư mục',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 19,
    name: 'Đợi',
    guildUrl: `${BASE_GUILD_URL}delay.html`,
    keyWord: 'đợi, delay, sleep',
    icon: 'carbon:condition-wait-point',
    description: 'Chờ đợi một khoản thời gian trước khi tiếp tục',
    script_template:
      '{{#if (equal time_type "fixed")}}\r\nawait F_delay(`{{num_seconds}}`);\r\n{{ else }}\r\nawait F_delayRandom(`{{num_start}}`, `{{num_end}}`);\r\n{{/if}}',
    parameters: [
      {
        key: 'time_type',
        type: 'select_option',
        label: 'Đợi theo thời gian',
        default_value: 'random',
        option_values: [
          {
            id: 1,
            label: 'Cố định',
            value: 'fixed',
            component: [
              {
                key: 'num_seconds',
                type: 'number',
                label: 'Số giây chờ đợi',
                is_required: true,
                default_value: 1,
              },
            ],
          },
          {
            id: 2,
            label: 'Ngẫu nhiên',
            value: 'random',
            component: [
              {
                key: 'num_start',
                type: 'number',
                label: 'Số bắt đầu (giây)',
                default_value: 1,
              },
              {
                key: 'num_end',
                type: 'number',
                label: 'Số kết thúc (giây)',
                default_value: 3,
              },
            ],
          },
        ],
      },
    ],
    alias: 'doi',
    parent: 13,
  },
  {
    id: 20,
    name: 'HTTP Request',
    guildUrl: `${BASE_GUILD_URL}http-request.html`,
    keyWord: 'http request',
    icon: 'uiw:global',
    description: 'Thực hiện một HTTP Request',
    script_template:
      "{{#if variable_name}} {{variable_name}} = {{/if}}await F_makeHTTPRequest('{{url}}','{{method}}',{{#isNotEmptyObject params}} {{{json params}}}, {{else}} null, {{/isNotEmptyObject}}{{#isNotEmptyObject headers}} {{{json headers}}}, {{else}} null, {{/isNotEmptyObject}}{{#if (equal content_type 'json')}}`{{{json_string_data}}}`,{{else}}{{#isNotEmptyObject data}} {{{json data}}}, {{/isNotEmptyObject}}{{/if}}'{{content_type}}', '{{response_type}}', {{#if path_data}} '{{path_data}}' {{/if}})",
    parameters: [
      {
        key: 'url',
        type: 'string',
        label: 'URL của request',
        is_required: true,
      },
      {
        key: 'method',
        type: 'select_option',
        label: 'Method',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'GET',
            value: 'GET',
          },
          {
            id: 2,
            label: 'POST',
            value: 'POST',
          },
          {
            id: 3,
            label: 'PUT',
            value: 'PUT',
          },
          {
            id: 4,
            label: 'DELETE',
            value: 'DELETE',
          },
          {
            id: 5,
            label: 'PATCH',
            value: 'PATCH',
          },
          {
            id: 6,
            label: 'HEAD',
            value: 'HEAD',
          },
          {
            id: 7,
            label: 'OPTIONS',
            value: 'OPTIONS',
          },
          {
            id: 8,
            label: 'TRACE',
            value: 'TRACE',
          },
          {
            id: 9,
            label: 'CONNECT',
            value: 'CONNECT',
          },
        ],
      },
      {
        key: 'params',
        type: 'object',
        label: 'URL Parameter',
        is_required: false,
      },
      {
        key: 'content_type',
        type: 'select_option',
        label: 'Content Type',
        is_required: true,
        default_value: 'json',
        option_values: [
          {
            id: 1,
            label: 'JSON',
            value: 'json',
            component: [
              {
                key: 'json_string_data',
                type: 'json_editor',
                label: 'JSON',
              },
            ],
          },
          {
            id: 2,
            label: 'Form-Data',
            value: 'form_multipart',
            component: [
              {
                key: 'data',
                type: 'object',
                label: 'Form-Data',
              },
            ],
          },
          {
            id: 3,
            label: 'Form-Urlencoded',
            value: 'form_urlencoded',
            component: [
              {
                key: 'data',
                type: 'object',
                label: 'Form-Urlencoded',
              },
            ],
          },
          {
            id: 4,
            label: 'Text',
            value: 'text',
            component: [
              {
                key: 'data',
                type: 'textarea',
                label: 'Text',
              },
            ],
          },
        ],
      },
      {
        key: 'headers',
        type: 'object',
        label: 'Custom headers',
        is_required: false,
      },
      {
        key: 'response_type',
        type: 'select_option',
        label: 'Response type',
        is_required: true,
        default_value: 'json',
        option_values: [
          {
            id: 1,
            label: 'JSON',
            value: 'json',
            component: [
              {
                key: 'path_data',
                type: 'string',
                label: 'Data path',
                is_required: false,
              },
            ],
          },
          {
            id: 2,
            label: 'Text',
            value: 'text',
          },
          {
            id: 3,
            label: 'arraybuffer',
            value: 'arraybuffer',
          },
        ],
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: false,
      },
    ],
    alias: 'http_request',
    parent: 13,
  },
  {
    id: 21,
    name: 'Nhấn chuột',
    guildUrl: `${BASE_GUILD_URL}web-interactions/mouse-click.html`,
    keyWord: 'nhấn chuột, click',
    icon: 'tabler:hand-click',
    description: 'Click chuột vào phần tử được chỉ định',
    script_template:
      '{{#if (equal mode "normal")}}\r\n{{#if (equal select_by "selector") }}\r\n{{#if (equal selector_type "css") }}\r\nawait rpa.clickElementBySelector(`{{{selector}}}`, { {{#if timeout}}timeout: `{{timeout}}`{{/if}} {{#if button}}, button: `{{button}}`{{/if}} })\r\n{{else if (equal selector_type "xpath")}}\r\nawait rpa.clickElementByXpath(`{{{selector}}}`, { {{#if timeout}}timeout: `{{timeout}}`{{/if}} {{#if button}}, button: `{{button}}`{{/if}} })\r\n{{/if}}\r\n{{else}}\r\nawait rpa.mouseClickPoint(`{{ x_coordinates}}`, `{{ y_coordinates}}`, { {{#if button}}button: `{{button}}`{{/if}} })\r\n{{/if}}\r\n{{else}}\r\n{{#if is_click_on_element }}\r\n{{#if (equal select_by "selector") }}\r\n{{#if (equal selector_type "css") }}\r\nawait rpa.pressHoldElementBySelector(`{{{selector}}}`, { {{#if timeout}}timeout: `{{timeout}}`{{/if}} {{#if button}}, button: `{{button}}`{{/if}}, pressTime: `{{press_time}}` })\r\n{{else if (equal selector_type "xpath")}}\r\nawait rpa.pressHoldElementByXpath(`{{{selector}}}`, { {{#if timeout}}timeout: `{{timeout}}`{{/if}} {{#if button}}, button: `{{button}}`{{/if}}, pressTime: `{{press_time}}` })\r\n{{/if}}\r\n{{else}}\r\nawait rpa.pressHoldByCoordinate(`{{ x_coordinates}}`, `{{ y_coordinates}}`, { {{#if button}}button: `{{button}}`{{/if}}, pressTime: `{{press_time}}` })\r\n{{/if}}\r\n{{else}}\r\nawait rpa.mousePressHold(`{{button}}`, `{{press_time}}`)\r\n{{/if}}\r\n{{/if}}',
    parameters: [
      {
        key: 'mode',
        type: 'select_option',
        label: 'Chế độ',
        is_required: 'true',
        default_value: 'normal',
        option_values: [
          {
            id: 1,
            label: 'Thông thường',
            value: 'normal',
            component: [
              {
                key: 'button',
                type: 'select_option',
                label: 'Nút nhấn',
                is_required: true,
                default_value: 'left',
                option_values: [
                  {
                    id: 1,
                    label: 'Trái',
                    value: 'left',
                  },
                  {
                    id: 2,
                    label: 'Phải',
                    value: 'right',
                  },
                  {
                    id: 3,
                    label: 'Giữa',
                    value: 'middle',
                  },
                ],
              },
              {
                key: 'select_by',
                type: 'select_option',
                label: 'Kiểu chọn',
                is_required: true,
                default_value: 'selector',
                option_values: [
                  {
                    id: 1,
                    label: 'Bộ chọn',
                    value: 'selector',
                    component: [
                      {
                        key: 'selector_type',
                        type: 'select_option',
                        label: 'Loại bộ chọn',
                        is_required: true,
                        option_values: [
                          {
                            id: 1,
                            label: 'CSS',
                            value: 'css',
                          },
                          {
                            id: 2,
                            label: 'Xpath',
                            value: 'xpath',
                          },
                        ],
                      },
                      {
                        key: 'selector',
                        type: 'string',
                        label: 'Bộ chọn của phần tử',
                        is_required: true,
                      },
                      {
                        key: 'timeout',
                        type: 'number',
                        label: 'Thời gian chờ tối đa (đơn vị giây)',
                        is_required: false,
                        default_value: 10,
                      },
                    ],
                  },
                  {
                    id: 2,
                    label: 'Tọa độ',
                    value: 'coordinates',
                    component: [
                      {
                        key: 'x_coordinates',
                        type: 'number',
                        label: 'Tọa độ X',
                        is_required: true,
                        default_value: 0,
                      },
                      {
                        key: 'y_coordinates',
                        type: 'number',
                        label: 'Tọa độ Y',
                        is_required: true,
                        default_value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 2,
            label: 'Nhấn giữ',
            value: 'press_hold',
            component: [
              {
                key: 'button',
                type: 'select_option',
                label: 'Nút nhấn',
                is_required: true,
                default_value: 'left',
                option_values: [
                  {
                    id: 1,
                    label: 'Trái',
                    value: 'left',
                  },
                  {
                    id: 2,
                    label: 'Phải',
                    value: 'right',
                  },
                  {
                    id: 3,
                    label: 'Giữa',
                    value: 'middle',
                  },
                ],
              },
              {
                key: 'press_time',
                type: 'number',
                label: 'Thời gian nhấn giữ (số giây)',
                is_required: true,
                default_value: 0,
              },
              {
                key: 'is_click_on_element',
                type: 'checkbox',
                label: 'Nhấn trên phần tử',
                component: [
                  {
                    key: 'select_by',
                    type: 'select_option',
                    label: 'Kiểu chọn',
                    is_required: true,
                    default_value: 'selector',
                    option_values: [
                      {
                        id: 1,
                        label: 'Bộ chọn',
                        value: 'selector',
                        component: [
                          {
                            key: 'selector_type',
                            type: 'select_option',
                            label: 'Loại bộ chọn',
                            is_required: true,
                            option_values: [
                              {
                                id: 1,
                                label: 'CSS',
                                value: 'css',
                              },
                              {
                                id: 2,
                                label: 'Xpath',
                                value: 'xpath',
                              },
                            ],
                          },
                          {
                            key: 'selector',
                            type: 'string',
                            label: 'Bộ chọn của phần tử',
                            is_required: true,
                          },
                          {
                            key: 'timeout',
                            type: 'number',
                            label: 'Thời gian chờ tối đa (đơn vị giây)',
                            is_required: false,
                            default_value: 10,
                          },
                        ],
                      },
                      {
                        id: 2,
                        label: 'Tọa độ',
                        value: 'coordinates',
                        component: [
                          {
                            key: 'x_coordinates',
                            type: 'number',
                            label: 'Tọa độ X',
                            is_required: true,
                            default_value: 0,
                          },
                          {
                            key: 'y_coordinates',
                            type: 'number',
                            label: 'Tọa độ Y',
                            is_required: true,
                            default_value: 0,
                          },
                        ],
                      },
                    ],
                  },
                ],
                is_required: true,
                default_value: false,
              },
            ],
          },
        ],
      },
    ],
    alias: 'nhan_chuot',
    parent: 15,
  },
  {
    id: 22,
    name: 'Mở URL',
    guildUrl: `${BASE_GUILD_URL}browsers/open-url.html`,
    keyWord: 'mở url, open ur',
    icon: 'ph:link-bold',
    description: 'Mở URL được chỉ định trên tab hiện tại',
    script_template: 'await rpa.F_gotoUrl(`{{{url}}}`,`{{timeout}}`, `{{wait_until}}`);',
    parameters: [
      {
        id: 1,
        key: 'url',
        type: 'string',
        label: 'Địa chỉ URL',
        is_required: true,
      },
      {
        id: 2,
        key: 'timeout',
        type: 'number',
        label: 'Thời gian chờ tối đa (đơn vị giây), mặc định 0 là đợi đến khi trang được tải',
        is_required: true,
        default_value: 0,
      },
      {
        id: 3,
        key: 'wait_until',
        type: 'select_option',
        label: 'Đợi đến khi sự kiện được kích hoạt',
        is_required: true,
        default_value: 'domcontentloaded',
        option_values: [
          {
            id: 1,
            label: 'load',
            value: 'load',
          },
          {
            id: 2,
            label: 'domcontentloaded',
            value: 'domcontentloaded',
          },
          {
            id: 3,
            label: 'networkidle0',
            value: 'networkidle0',
          },
          {
            id: 4,
            label: 'networkidle2',
            value: 'networkidle2',
          },
        ],
      },
    ],
    alias: 'mo_url',
    parent: 14,
  },
  {
    id: 23,
    name: 'Lấy văn bản',
    guildUrl: `${BASE_GUILD_URL}web-interactions/get-text.html`,
    keyWord: 'lấy văn bản, get text',
    icon: 'icon-park-outline:file-text',
    description: 'Lấy nội dung văn bản của một phần tử trong trang web',
    script_template:
      '{{#if (equal selector_type "css")}}\r\n{{variable_name}} = await rpa.getTextBySelector(`{{{selector}}}`)\r\n{{else if (equal selector_type "xpath")}}\r\n{{variable_name}} = await rpa.getTextByXpath(`{{{selector}}}`)\r\n{{/if}}',
    parameters: [
      {
        id: 3,
        key: 'selector_type',
        type: 'select_option',
        label: 'Loại bộ chọn',
        is_required: true,
        default_value: 'css',
        option_values: [
          {
            id: 1,
            label: 'CSS',
            value: 'css',
          },
          {
            id: 2,
            label: 'Xpath',
            value: 'xpath',
          },
        ],
      },
      {
        id: 1,
        key: 'selector',
        type: 'string',
        label: 'Bộ chọn',
        is_required: true,
      },
      {
        id: 2,
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
    ],
    alias: 'lay_van_ban',
    parent: 15,
  },
  {
    id: 24,
    name: 'Mở tab mới',
    guildUrl: `${BASE_GUILD_URL}browsers/new-tab.html`,
    keyWord: 'mở tab mới, new tab',
    icon: 'lucide:plus-circle',
    description: 'Mở tab mới với URL được chỉ định',
    script_template:
      '{{#if url}}\r\nawait rpa.F_newTab(`{{{url}}}`, `{{timeout}}`, "{{wait_until}}");\r\n{{else}}\r\nawait rpa.F_newTab("", `{{timeout}}`);\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'url',
        type: 'string',
        label: 'Địa chỉ URL',
        is_required: false,
      },
      {
        id: 2,
        key: 'timeout',
        type: 'number',
        label: 'Thời gian chờ tối đa (đơn vị giây), mặc định 0 là đợi đến khi trang được tải',
        is_required: true,
        default_value: 0,
      },
      {
        id: 3,
        key: 'wait_until',
        type: 'select_option',
        label: 'Đợi đến khi sự kiện được kích hoạt',
        is_required: true,
        default_value: 'domcontentloaded',
        option_values: [
          {
            id: 1,
            label: 'load',
            value: 'load',
          },
          {
            id: 2,
            label: 'domcontentloaded',
            value: 'domcontentloaded',
          },
          {
            id: 3,
            label: 'networkidle0',
            value: 'networkidle0',
          },
          {
            id: 4,
            label: 'networkidle2',
            value: 'networkidle2',
          },
        ],
      },
    ],
    alias: 'mo_tab_moi',
    parent: 14,
  },
  {
    id: 26,
    name: 'Bảng tính',
    guildUrl: `${BASE_GUILD_URL}data/sheetspread.html`,
    keyWord: 'bảng tính, spreadsheet',
    icon: 'teenyicons:spreadsheet-outline',
    description: 'Đọc ghi file excel hoặc google sheet',
    script_template:
      '{{#if (equal spreadsheet_type "excel")}}\r\n  {{#if (equal action_type "read")}}\r\n    {{variable_name}} = await readExcelFile(`{{file_path}}`, {\r\n{{#if sheet_name}}\r\nsheet_name: `{{sheet_name}}`,\r\n{{/if}}\r\n{{#if range}}\r\nrange: `{{range}}`,\r\n{{/if}}\r\n{{#if is_choose_first_rows_as_key}}\r\nis_choose_first_rows_as_key: {{is_choose_first_rows_as_key}},\r\n{{/if}}\r\n    });\r\n  {{else if (equal action_type "write")}}\r\n  await writeDataToExcel(`{{file_path}}`, {{data}},{\r\n{{#if sheet_name}}\r\nsheet_name: `{{sheet_name}}`,\r\n{{/if}}\r\n{{#if is_choose_first_rows_as_key}}\r\n    is_choose_first_rows_as_key: {{is_choose_first_rows_as_key}},\r\n    {{/if}}\r\n    });\r\n  {{else if (equal action_type "append")}}\r\n await insertDataToExcel(`{{file_path}}`, \r\n{{data}}\r\n{{#if sheet_name}}\r\n ,sheet_name: `{{sheet_name}}`\r\n{{/if}}\r\n    );\r\n    {{else if (equal action_type "update")}}\r\n updateDataToExcel(`{{file_path}}`,\r\n{{data}},{\r\n{{#if sheet_name}}\r\nsheet_name: `{{sheet_name}}`,\r\n{{/if}}\r\n{{#if search_field}}\r\nsearch_field: `{{search_field}}`,\r\n{{/if}}\r\n{{#if search_value}}\r\nsearch_value: `{{search_value}}`,\r\n{{/if}}\r\n    });\r\n    {{else if (equal action_type "clear")}}\r\n    clearDataByRangeInExcel(`{{file_path}}`, `{{range}}` {{#if sheet_name}} , `{{sheet_name}}` {{/if}})\r\n  {{/if}}\r\n{{else if (equal spreadsheet_type "google_sheet")}}\r\n  {{#if (equal action_type "read")}}\r\n  {{variable_name}} = await F_getDataFromGoogleSheet(\r\n{{#if credentials_json}}\r\n`{{credentials_json}}`,\r\n{{/if}}\r\n{{#if sheet_id}}\r\n`{{sheet_id}}`,\r\n{{/if}}\r\n{\r\n  {{#if sheet_name}}\r\n  sheet_title: `{{sheet_name}}`,\r\n  {{/if}}\r\n  {{#if range}}\r\n  range: `{{range}}`,\r\n  {{/if}}\r\n  {{#if is_choose_first_rows_as_key}}\r\n  is_choose_first_rows_as_key: {{is_choose_first_rows_as_key}},\r\n  {{/if}}\r\n}\r\n);\r\n  {{else if (equal action_type "write")}}\r\n    await writeDataToGoogleSheet(\r\n  `{{credentials_json}}`,\r\n  `{{sheet_id}}`,\r\n  {{{json data}}},\r\n  {\r\n    {{#if sheet_name}}\r\n    sheet_title: `{{sheet_name}}`,\r\n    {{/if}}\r\n    {{#if is_choose_first_rows_as_key}}\r\n    is_choose_first_rows_as_key: {{is_choose_first_rows_as_key}},\r\n    {{/if}}\r\n  }\r\n  );\r\n   {{else if (equal action_type "append")}}\r\n   await F_appendDataToGoogleSheet(\r\n  `{{credentials_json}}`,\r\n  `{{sheet_id}}`,\r\n  {{data}},\r\n  {\r\n    {{#if sheet_name}}\r\n    sheet_title: `{{sheet_name}}`,\r\n    {{/if}}\r\n    {{#if is_choose_first_rows_as_key}}\r\n    is_choose_first_rows_as_key: {{is_choose_first_rows_as_key}},\r\n    {{/if}}\r\n  }\r\n  );\r\n  {{else if (equal action_type "update")}}\r\n    await updateDataToGoogleSheet(\r\n  `{{credentials_json}}`,\r\n  `{{sheet_id}}`,\r\n  {{{json data_update}}},\r\n  {\r\n    {{#if sheet_name}}\r\n    sheet_title: `{{sheet_name}}`,\r\n    {{/if}}\r\n    {{#if search_field}}\r\n    search_field: `{{search_field}}`,\r\n    {{/if}}\r\n    {{#if search_value}}\r\n    search_value: `{{search_value}}`,\r\n    {{/if}}\r\n  }\r\n  );\r\n  {{else if (equal action_type "clear")}}\r\n await clearDataByRangeInGoogleSheet(\r\n  `{{credentials_json}}`,\r\n  `{{sheet_id}}`,\r\n  `{{range}}`\r\n  {{#if sheet_name}}\r\n  ,\r\n  `{{sheet_name}}`\r\n  {{/if}}\r\n  )\r\n  {{else if (equal action_type "delete_row")}}\r\n await deleteGoogleSheetRow(\r\n  `{{credentials_json}}`,\r\n  `{{sheet_id}}`,\r\n  {\r\n    {{#if sheet_name}}\r\n    sheet_title: `{{sheet_name}}`,\r\n    {{/if}}\r\n    {{#if search_field}}\r\n    search_field: `{{search_field}}`,\r\n    {{/if}}\r\n    {{#if search_value}}\r\n    search_value: `{{search_value}}`,\r\n    {{/if}}\r\n   }\r\n  )\r\n   {{else if (equal action_type "find_row")}}\r\n  {{variable_name}} = await findGoogleSheetRow(\r\n  `{{credentials_json}}`,\r\n  `{{sheet_id}}`,\r\n  {\r\n    {{#if sheet_name}}\r\n    sheet_title: `{{sheet_name}}`,\r\n    {{/if}}\r\n    {{#if search_field}}\r\n    search_field: `{{search_field}}`,\r\n    {{/if}}\r\n    {{#if search_value}}\r\n    search_value: `{{search_value}}`,\r\n    {{/if}}\r\n   }\r\n  )\r\n  {{/if}}\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'spreadsheet_type',
        type: 'select_option',
        label: 'Loại bảng tính',
        is_required: true,
        default_value: 'google_sheet',
        option_values: [
          {
            id: 1,
            label: 'Tệp excel',
            value: 'excel',
            component: [
              {
                key: 'file_path',
                type: 'choose_file',
                label: 'File Excel',
                is_required: true,
              },
              {
                key: 'sheet_name',
                type: 'string',
                label: 'Tên trang tính (Tùy chọn)',
                is_required: false,
              },
              {
                key: 'action_type',
                type: 'select_option',
                label: 'Hành động',
                is_required: true,
                default_value: 'read',
                option_values: [
                  {
                    id: 1,
                    label: 'Đọc',
                    value: 'read',
                    component: [
                      {
                        key: 'range',
                        type: 'string',
                        label: 'Range (Tùy chọn)',
                        is_required: false,
                      },
                      {
                        key: 'is_choose_first_rows_as_key',
                        type: 'checkbox',
                        label: 'Chọn hàng đầu tiên làm khóa',
                        is_required: false,
                        default_value: true,
                      },
                      {
                        key: 'variable_name',
                        type: 'select_variable',
                        label: 'Biến nhận dữ liệu',
                        is_required: true,
                      },
                    ],
                  },
                  {
                    id: 2,
                    label: 'Ghi',
                    value: 'write',
                    component: [
                      {
                        key: 'data',
                        type: 'select_variable',
                        label: 'Biến dữ liệu',
                        is_required: true,
                      },
                      {
                        key: 'is_choose_first_rows_as_key',
                        type: 'checkbox',
                        label: 'Chọn hàng đầu tiên làm khóa',
                        is_required: false,
                        default_value: true,
                      },
                    ],
                  },
                  {
                    id: 3,
                    label: 'Ghi thêm',
                    value: 'append',
                    component: [
                      {
                        key: 'data',
                        type: 'select_variable',
                        label: 'Biến dữ liệu',
                        is_required: true,
                      },
                      {
                        key: 'is_choose_first_rows_as_key',
                        type: 'checkbox',
                        label: 'Chọn hàng đầu tiên làm khóa',
                        is_required: false,
                        default_value: true,
                      },
                    ],
                  },
                  {
                    id: 4,
                    label: 'Cập nhật',
                    value: 'update',
                    component: [
                      {
                        key: 'search_field',
                        type: 'string',
                        label: 'Thuộc tính tìm kiếm',
                        is_required: false,
                      },
                      {
                        key: 'search_value',
                        type: 'string',
                        label: 'Giá trị tìm kiếm',
                        is_required: false,
                      },
                      {
                        key: 'data_update',
                        type: 'object',
                        label: 'Dữ liệu cập nhật',
                        is_required: false,
                      },
                    ],
                  },
                  {
                    id: 5,
                    label: 'Xóa giá trị ô',
                    value: 'clear',
                    component: [
                      {
                        key: 'range',
                        type: 'string',
                        label: 'Range',
                        is_required: true,
                      },
                    ],
                  },
                  {
                    id: 6,
                    label: 'Xóa hàng',
                    value: 'delete_row',
                    component: [
                      {
                        key: 'search_field',
                        type: 'string',
                        label: 'Thuộc tính tìm kiếm',
                        is_required: false,
                      },
                      {
                        key: 'search_value',
                        type: 'string',
                        label: 'Giá trị tìm kiếm',
                        is_required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 3,
            label: 'Google Sheets',
            value: 'google_sheet',
            component: [
              {
                key: 'credentials_json',
                type: 'choose_file',
                label: 'Đường dẫn file json xác thực',
                is_required: true,
              },
              {
                key: 'email_share',
                type: 'string',
                label: 'Email chia sẽ',
                is_required: true,
              },
              {
                key: 'sheet_id',
                type: 'string',
                label: 'ID Bảng tính',
                is_required: true,
              },
              {
                key: 'sheet_name',
                type: 'string',
                label: 'Tên trang tính (Tùy chọn)',
                is_required: false,
              },
              {
                key: 'action_type',
                type: 'select_option',
                label: 'Hành động',
                is_required: true,
                default_value: 'read',
                option_values: [
                  {
                    id: 1,
                    label: 'Đọc',
                    value: 'read',
                    component: [
                      {
                        key: 'range',
                        type: 'string',
                        label: 'Range (Tùy chọn)',
                        is_required: false,
                      },
                      {
                        key: 'is_choose_first_rows_as_key',
                        type: 'checkbox',
                        label: 'Chọn hàng đầu tiên làm khóa',
                        is_required: false,
                        default_value: true,
                      },
                      {
                        key: 'variable_name',
                        type: 'select_variable',
                        label: 'Biến nhận dữ liệu',
                        is_required: true,
                      },
                    ],
                  },
                  {
                    id: 2,
                    label: 'Tìm kiếm',
                    value: 'find_row',
                    component: [
                      {
                        key: 'search_field',
                        type: 'string',
                        label: 'Thuộc tính tìm kiếm',
                        is_required: true,
                      },
                      {
                        key: 'search_value',
                        type: 'string',
                        label: 'Giá trị tìm kiếm',
                        is_required: true,
                      },
                      {
                        key: 'variable_name',
                        type: 'select_variable',
                        label: 'Biến nhận dữ liệu',
                        is_required: true,
                      },
                    ],
                  },
                  {
                    id: 3,
                    label: 'Ghi',
                    value: 'write',
                    component: [
                      {
                        key: 'data',
                        type: 'select_variable',
                        label: 'Biến dữ liệu',
                        is_required: true,
                      },
                      {
                        key: 'range',
                        type: 'string',
                        label: 'Range (Tùy chọn)',
                        is_required: false,
                      },
                      {
                        key: 'is_choose_first_rows_as_key',
                        type: 'checkbox',
                        label: 'Chọn hàng đầu tiên làm khóa',
                        is_required: false,
                        default_value: true,
                      },
                    ],
                  },
                  {
                    id: 4,
                    label: 'Ghi thêm',
                    value: 'append',
                    component: [
                      {
                        key: 'data',
                        type: 'select_variable',
                        label: 'Biến dữ liệu',
                        is_required: true,
                      },
                      {
                        key: 'is_choose_first_rows_as_key',
                        type: 'checkbox',
                        label: 'Chọn hàng đầu tiên làm khóa',
                        is_required: false,
                        default_value: true,
                      },
                    ],
                  },
                  {
                    id: 5,
                    label: 'Cập nhật',
                    value: 'update',
                    component: [
                      {
                        key: 'search_field',
                        type: 'string',
                        label: 'Thuộc tính tìm kiếm',
                        is_required: true,
                      },
                      {
                        key: 'search_value',
                        type: 'string',
                        label: 'Giá trị tìm kiếm',
                        is_required: true,
                      },
                      {
                        key: 'data_update',
                        type: 'object',
                        label: 'Dữ liệu cập nhật',
                        is_required: false,
                      },
                    ],
                  },
                  {
                    id: 6,
                    label: 'Xóa giá trị ô',
                    value: 'clear',
                    component: [
                      {
                        key: 'range',
                        type: 'string',
                        label: 'Range',
                        is_required: true,
                      },
                    ],
                  },
                  {
                    id: 7,
                    label: 'Xóa hàng',
                    value: 'delete_row',
                    component: [
                      {
                        key: 'search_field',
                        type: 'string',
                        label: 'Thuộc tính tìm kiếm',
                        is_required: true,
                      },
                      {
                        key: 'search_value',
                        type: 'string',
                        label: 'Giá trị tìm kiếm',
                        is_required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    alias: 'bang_tinh',
    parent: 16,
  },
  {
    id: 28,
    name: 'Chuyển tab',
    guildUrl: `${BASE_GUILD_URL}browsers/switch-tab.html`,
    keyWord: 'chuyển tab, switch tab',
    icon: 'material-symbols:tab-outline',
    description: 'Chuyển sang tab được chỉ định',
    script_template:
      '{{#if (equal find_by "match_pattern")}}\r\nawait rpa.switchTabByUrlPattern("{{pattern}}"{{#unless is_active}}, false{{/unless}});{{else if (equal find_by "match_title")}}\r\nawait rpa.switchTabByTitle("{{title}}"{{#unless is_active}}, false{{/unless}});\r\n{{else if (equal find_by "next_tab")}}\r\nawait rpa.switchNextTab({{#unless is_active}}false{{/unless}});\r\n{{else if (equal find_by "previous_tab")}}\r\nawait rpa.switchPreviousTab({{#unless is_active}}false{{/unless}});\r\n{{else if (equal find_by "tab_order")}}\r\nawait rpa.switchTabByOrderNumber({{order_number}}{{#unless is_active}}, false{{/unless}});\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'find_by',
        type: 'select_option',
        label: 'Tìm kiếm tab theo',
        is_required: true,
        default_value: 1,
        option_values: [
          {
            id: 1,
            label: 'Khớp với mẫu',
            value: 'match_pattern',
            component: [
              {
                id: 1,
                key: 'pattern',
                type: 'string',
                label: 'Mẫu',
              },
            ],
          },
          {
            id: 2,
            label: 'Tiêu đề tab',
            value: 'match_tile',
            component: [
              {
                id: 1,
                key: 'title',
                type: 'string',
                label: 'Tiêu đề',
              },
            ],
          },
          {
            id: 3,
            label: 'Tab bên phải',
            value: 'next_tab',
          },
          {
            id: 4,
            label: 'Tab bên trái',
            value: 'previous_tab',
          },
          {
            id: 5,
            label: 'Thứ tự tab',
            value: 'tab_order',
            component: [
              {
                id: 1,
                key: 'order_number',
                type: 'number',
                label: 'Thứ tự',
                is_required: true,
              },
            ],
          },
        ],
      },
      {
        key: 'is_active',
        type: 'checkbox',
        label: 'Đặt làm tab hoạt động',
        default_value: true,
      },
    ],
    alias: 'chuyen_tab',
    parent: 14,
  },
  {
    id: 29,
    name: 'Đóng tab',
    guildUrl: `${BASE_GUILD_URL}browsers/close-tab.html`,
    keyWord: 'đóng tab, close tab',
    icon: 'zondicons:close-outline',
    description: 'Đóng tab được chỉ định',
    script_template:
      '{{#if (equal close_type "current")}}\r\nawait rpa.closeTab();\r\n{{else if (equal close_type "match_pattern")}}\r\nawait rpa.closeTabByUrlPattern(`{{pattern}}`);\r\n{{else if (equal close_type "match_title")}}\r\nawait rpa.closeTabByTitle(`{{title}}`);\r\n{{else if (equal close_type "order")}}\r\nawait rpa.closeTabByOrderNumber(`{{number_order}}`);\r\n{{else if (equal close_type "other_tabs")}}\r\nawait rpa.closeOthersTabs();\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'close_type',
        type: 'select_option',
        label: 'Tab đóng',
        is_required: true,
        default_value: 'current',
        option_values: [
          {
            id: 1,
            label: 'Tab đang hoạt động',
            value: 'current',
          },
          {
            id: 2,
            label: 'Tab khớp với mẫu',
            value: 'match_pattern',
            component: [
              {
                key: 'pattern',
                type: 'string',
                label: 'Mẫu',
                is_required: true,
              },
            ],
          },
          {
            id: 3,
            label: 'Tab khớp với tiêu đề',
            value: 'match_title',
            component: [
              {
                key: 'title',
                type: 'string',
                label: 'Tiêu đề',
                is_required: true,
              },
            ],
          },
          {
            id: 4,
            label: 'Tab có thứ tự',
            value: 'order',
            component: [
              {
                key: 'number_order',
                type: 'number',
                label: 'Thứ tự tab',
                is_required: true,
              },
            ],
          },
          {
            id: 5,
            label: 'Trừ tab đang hoạt động',
            value: 'other_tabs',
          },
        ],
      },
    ],
    alias: 'dong_tab',
    parent: 14,
  },
  {
    id: 30,
    name: 'Quay lại',
    guildUrl: `${BASE_GUILD_URL}browsers/go-back.html`,
    keyWord: 'quay lại, go back',
    icon: 'ep:back',
    description: 'Quay lại trang trước đó',
    script_template: 'await rpa.goBack();',
    parameters: null,
    alias: 'quay_lai',
    parent: 14,
  },
  {
    id: 31,
    name: 'Tiến lên',
    guildUrl: `${BASE_GUILD_URL}browsers/go-forward.html`,
    keyWord: 'tiến lên, go forward',
    icon: 'mdi:arrow-right',
    description: 'Tiến lên trang sau đó',
    script_template: 'await rpa.goForward();',
    parameters: null,
    alias: 'tien_len',
    parent: 14,
  },
  {
    id: 32,
    name: 'Nhập văn bản',
    guildUrl: `${BASE_GUILD_URL}web-interactions/type-text.html`,
    keyWord: 'nhập văn bản, type text, gõ văn bản',
    icon: 'icon-park-outline:text',
    description: 'Gõ văn bản',
    script_template:
      '{{#if selector_type}}\r\n{{#if (equal selector_type "css") }}\r\nawait rpa.typeBySelector(`{{{selector}}}`, `{{text}}`, `{{speed}}`)\r\n{{else}}\r\nawait rpa.F_typeByXpath(`{{{selector}}}`, `{{text}}`, `{{speed}}`)\r\n{{/if}}\r\n{{else}}\r\nawait rpa.F_typeText(`{{text}}`, `{{speed}}`)\r\n{{/if}}',
    parameters: [
      {
        key: 'selector_type',
        type: 'select_option',
        label: 'Loại bộ chọn (tùy chọn)',
        is_required: false,
        option_values: [
          {
            id: 1,
            label: 'CSS',
            value: 'css',
            component: [
              {
                key: 'selector',
                type: 'string',
                label: 'Bộ chọn phần tử',
                is_required: true,
              },
            ],
          },
          {
            id: 2,
            label: 'Xpath',
            value: 'xpath',
            component: [
              {
                key: 'selector',
                type: 'string',
                label: 'Bộ chọn phần tử',
                is_required: true,
              },
            ],
          },
        ],
      },
      {
        key: 'text',
        type: 'textarea',
        label: 'Văn bản',
        is_required: true,
      },
      {
        key: 'speed',
        type: 'number',
        label: 'Khoảng thời gian giữa các lần gõ (số giây)',
        is_required: true,
        default_value: 0.1,
      },
    ],
    alias: 'nhap_van_ban',
    parent: 15,
  },
  {
    id: 33,
    name: 'Tải lại trang',
    guildUrl: `${BASE_GUILD_URL}browsers/reload-tab.html`,
    keyWord: 'tải lại trang, reload page',
    icon: 'tabler:reload',
    description: 'Tại lại trang',
    script_template: 'await rpa.reloadTab();',
    parameters: null,
    alias: 'tai_lai_trang',
    parent: 14,
  },
  {
    id: 34,
    name: 'Nhấn phím',
    guildUrl: `${BASE_GUILD_URL}web-interactions/press-key.html`,
    keyWord: 'nhấn phím, press key',
    icon: 'mdi:keyboard-outline',
    description: 'Thao tác nhấn phím',
    script_template: 'await rpa.keyboardPressCombination({{{json keys}}})',
    parameters: [
      {
        id: 1,
        key: 'keys',
        type: 'select_multiple_option',
        label: 'Phím nhấn',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'Cancel',
            value: '3',
          },
          {
            id: 2,
            label: 'Backspace',
            value: '8',
          },
          {
            id: 3,
            label: 'Tab',
            value: '9',
          },
          {
            id: 4,
            label: 'Clear',
            value: '12',
          },
          {
            id: 5,
            label: 'Enter',
            value: '13',
          },
          {
            id: 6,
            label: 'Shift',
            value: '16',
          },
          {
            id: 8,
            label: 'Control',
            value: '17',
          },
          {
            id: 10,
            label: 'Alt',
            value: '18',
          },
          {
            id: 12,
            label: 'Pause',
            value: '19',
          },
          {
            id: 13,
            label: 'CapsLock',
            value: '20',
          },
          {
            id: 16,
            label: 'Escape',
            value: '27',
          },
          {
            id: 17,
            label: 'henkan',
            value: '28',
          },
          {
            id: 18,
            label: 'muhenkan',
            value: '29',
          },
          {
            id: 19,
            label: '(blank space)',
            value: '32',
          },
          {
            id: 20,
            label: 'PageUp',
            value: '33',
          },
          {
            id: 21,
            label: 'PageDown',
            value: '34',
          },
          {
            id: 22,
            label: 'End',
            value: '35',
          },
          {
            id: 23,
            label: 'Home',
            value: '36',
          },
          {
            id: 24,
            label: 'ArrowLeft',
            value: '37',
          },
          {
            id: 25,
            label: 'ArrowUp',
            value: '38',
          },
          {
            id: 26,
            label: 'ArrowRight',
            value: '39',
          },
          {
            id: 27,
            label: 'ArrowDown',
            value: '40',
          },
          {
            id: 28,
            label: 'Select',
            value: '41',
          },
          {
            id: 29,
            label: 'Print',
            value: '42',
          },
          {
            id: 30,
            label: 'Execute',
            value: '43',
          },
          {
            id: 31,
            label: 'F13',
            value: '44',
          },
          {
            id: 32,
            label: 'Insert',
            value: '45',
          },
          {
            id: 33,
            label: 'Delete',
            value: '46',
          },
          {
            id: 34,
            label: 'Help',
            value: '47',
          },
          {
            id: 35,
            label: '0',
            value: '48',
          },
          {
            id: 38,
            label: '1',
            value: '49',
          },
          {
            id: 41,
            label: '2',
            value: '50',
          },
          {
            id: 45,
            label: '3',
            value: '51',
          },
          {
            id: 49,
            label: '4',
            value: '52',
          },
          {
            id: 52,
            label: '5',
            value: '53',
          },
          {
            id: 56,
            label: '6',
            value: '54',
          },
          {
            id: 59,
            label: '7',
            value: '55',
          },
          {
            id: 62,
            label: '8',
            value: '56',
          },
          {
            id: 65,
            label: '9',
            value: '57',
          },
          {
            id: 69,
            label: ':',
            value: '58',
          },
          {
            id: 70,
            label: ';',
            value: '59',
          },
          {
            id: 71,
            label: '<',
            value: '60',
          },
          {
            id: 72,
            label: '=',
            value: '61',
          },
          {
            id: 73,
            label: 'ß',
            value: '63',
          },
          {
            id: 74,
            label: '@',
            value: '64',
          },
          {
            id: 75,
            label: 'a',
            value: '65',
          },
          {
            id: 77,
            label: 'b',
            value: '66',
          },
          {
            id: 79,
            label: 'c',
            value: '67',
          },
          {
            id: 81,
            label: 'd',
            value: '68',
          },
          {
            id: 84,
            label: 'e',
            value: '69',
          },
          {
            id: 87,
            label: 'f',
            value: '70',
          },
          {
            id: 89,
            label: 'g',
            value: '71',
          },
          {
            id: 90,
            label: 'h',
            value: '72',
          },
          {
            id: 93,
            label: 'i',
            value: '73',
          },
          {
            id: 97,
            label: 'j',
            value: '74',
          },
          {
            id: 99,
            label: 'k',
            value: '75',
          },
          {
            id: 101,
            label: 'l',
            value: '76',
          },
          {
            id: 103,
            label: 'm',
            value: '77',
          },
          {
            id: 105,
            label: 'n',
            value: '78',
          },
          {
            id: 109,
            label: 'o',
            value: '79',
          },
          {
            id: 111,
            label: 'p',
            value: '80',
          },
          {
            id: 114,
            label: 'q',
            value: '81',
          },
          {
            id: 117,
            label: 'r',
            value: '82',
          },
          {
            id: 119,
            label: 's',
            value: '83',
          },
          {
            id: 121,
            label: 't',
            value: '84',
          },
          {
            id: 124,
            label: 'u',
            value: '85',
          },
          {
            id: 128,
            label: 'v',
            value: '86',
          },
          {
            id: 130,
            label: 'w',
            value: '87',
          },
          {
            id: 134,
            label: 'x',
            value: '88',
          },
          {
            id: 136,
            label: 'y',
            value: '89',
          },
          {
            id: 139,
            label: 'z',
            value: '90',
          },
          {
            id: 142,
            label: 'Meta',
            value: '91',
          },
          {
            id: 143,
            label: 'Meta',
            value: '92',
          },
          {
            id: 144,
            label: 'ContextMenu',
            value: '93',
          },
          {
            id: 145,
            label: 'Standby',
            value: '95',
          },
          {
            id: 146,
            label: '0',
            value: '96',
          },
          {
            id: 147,
            label: '1',
            value: '97',
          },
          {
            id: 148,
            label: '2',
            value: '98',
          },
          {
            id: 149,
            label: '3',
            value: '99',
          },
          {
            id: 150,
            label: '4',
            value: '100',
          },
          {
            id: 151,
            label: '5',
            value: '101',
          },
          {
            id: 152,
            label: '6',
            value: '102',
          },
          {
            id: 153,
            label: '7',
            value: '103',
          },
          {
            id: 154,
            label: '8',
            value: '104',
          },
          {
            id: 155,
            label: '9',
            value: '105',
          },
          {
            id: 156,
            label: '*',
            value: '106',
          },
          {
            id: 157,
            label: '+',
            value: '107',
          },
          {
            id: 158,
            label: ',',
            value: '108',
          },
          {
            id: 159,
            label: '-',
            value: '109',
          },
          {
            id: 160,
            label: '.',
            value: '110',
          },
          {
            id: 161,
            label: '/',
            value: '111',
          },
          {
            id: 162,
            label: 'F1',
            value: '112',
          },
          {
            id: 163,
            label: 'F2',
            value: '113',
          },
          {
            id: 164,
            label: 'F3',
            value: '114',
          },
          {
            id: 165,
            label: 'F4',
            value: '115',
          },
          {
            id: 166,
            label: 'F5',
            value: '116',
          },
          {
            id: 167,
            label: 'F6',
            value: '117',
          },
          {
            id: 168,
            label: 'F7',
            value: '118',
          },
          {
            id: 169,
            label: 'F8',
            value: '119',
          },
          {
            id: 170,
            label: 'F9',
            value: '120',
          },
          {
            id: 171,
            label: 'F10',
            value: '121',
          },
          {
            id: 172,
            label: 'F11',
            value: '122',
          },
          {
            id: 173,
            label: 'F12',
            value: '123',
          },
          {
            id: 174,
            label: 'F13',
            value: '124',
          },
          {
            id: 175,
            label: 'F14',
            value: '125',
          },
          {
            id: 176,
            label: 'F15',
            value: '126',
          },
          {
            id: 177,
            label: 'F16',
            value: '127',
          },
          {
            id: 178,
            label: 'F17',
            value: '128',
          },
          {
            id: 179,
            label: 'F18',
            value: '129',
          },
          {
            id: 180,
            label: 'F19',
            value: '130',
          },
          {
            id: 181,
            label: 'F20',
            value: '131',
          },
          {
            id: 182,
            label: 'F21',
            value: '132',
          },
          {
            id: 183,
            label: 'F22',
            value: '133',
          },
          {
            id: 184,
            label: 'F23',
            value: '134',
          },
          {
            id: 185,
            label: 'F24',
            value: '135',
          },
          {
            id: 186,
            label: 'F25',
            value: '136',
          },
          {
            id: 187,
            label: 'F26',
            value: '137',
          },
          {
            id: 188,
            label: 'F27',
            value: '138',
          },
          {
            id: 189,
            label: 'F28',
            value: '139',
          },
          {
            id: 190,
            label: 'F29',
            value: '140',
          },
          {
            id: 191,
            label: 'F30',
            value: '141',
          },
          {
            id: 192,
            label: 'F31',
            value: '142',
          },
          {
            id: 193,
            label: 'F32',
            value: '143',
          },
          {
            id: 194,
            label: 'NumLock',
            value: '144',
          },
          {
            id: 195,
            label: 'ScrollLock',
            value: '145',
          },
          {
            id: 196,
            label: '',
            value: '151',
          },
          {
            id: 197,
            label: '^',
            value: '160',
          },
          {
            id: 198,
            label: 'Dead',
            value: '161',
          },
          {
            id: 199,
            label: '',
            value: '162',
          },
          {
            id: 200,
            label: '#',
            value: '163',
          },
          {
            id: 201,
            label: '$',
            value: '164',
          },
          {
            id: 202,
            label: '^ù',
            value: '165',
          },
          {
            id: 203,
            label: 'BrowserBack',
            value: '166',
          },
          {
            id: 204,
            label: 'BrowserForward',
            value: '167',
          },
          {
            id: 205,
            label: 'BrowserRefresh',
            value: '168',
          },
          {
            id: 206,
            label: ')',
            value: '169',
          },
          {
            id: 207,
            label: '*',
            value: '170',
          },
          {
            id: 208,
            label: '+',
            value: '171',
          },
          {
            id: 209,
            label: '|',
            value: '172',
          },
          {
            id: 210,
            label: '-',
            value: '173',
          },
          {
            id: 211,
            label: 'AudioVolumeDown',
            value: '174',
          },
          {
            id: 212,
            label: 'AudioVolumeUp',
            value: '175',
          },
          {
            id: 213,
            label: 'MediaTrackNext',
            value: '176',
          },
          {
            id: 214,
            label: 'MediaTrackPrevious',
            value: '177',
          },
          {
            id: 215,
            label: 'MediaStop',
            value: '178',
          },
          {
            id: 216,
            label: 'MediaPlayPause',
            value: '179',
          },
          {
            id: 217,
            label: 'LaunchMail',
            value: '180',
          },
          {
            id: 218,
            label: 'AudioVolumeMute',
            value: '181',
          },
          {
            id: 219,
            label: 'AudioVolumeDown',
            value: '182',
          },
          {
            id: 220,
            label: 'AudioVolumeUp',
            value: '183',
          },
          {
            id: 221,
            label: ';',
            value: '186',
          },
          {
            id: 224,
            label: '=',
            value: '187',
          },
          {
            id: 228,
            label: ',',
            value: '188',
          },
          {
            id: 231,
            label: '-',
            value: '189',
          },
          {
            id: 234,
            label: '.',
            value: '190',
          },
          {
            id: 237,
            label: '/',
            value: '191',
          },
          {
            id: 241,
            label: '`',
            value: '192',
          },
          {
            id: 243,
            label: '/',
            value: '193',
          },
          {
            id: 244,
            label: '.',
            value: '194',
          },
          {
            id: 245,
            label: '[',
            value: '219',
          },
          {
            id: 250,
            label: '\\',
            value: '220',
          },
          {
            id: 252,
            label: ']',
            value: '221',
          },
          {
            id: 255,
            label: "'",
            value: '222',
          },
          {
            id: 258,
            label: '`',
            value: '223',
          },
          {
            id: 259,
            label: 'Meta',
            value: '224',
          },
          {
            id: 260,
            label: 'AltGraph',
            value: '225',
          },
          {
            id: 261,
            label: '\\',
            value: '226',
          },
          {
            id: 262,
            label: 'Dead',
            value: '229',
          },
          {
            id: 263,
            label: '',
            value: '230',
          },
          {
            id: 264,
            label: '',
            value: '231',
          },
          {
            id: 265,
            label: '',
            value: '233',
          },
          {
            id: 266,
            label: '',
            value: '234',
          },
          {
            id: 267,
            label: '',
            value: '235',
          },
          {
            id: 268,
            label: 'Alphanumeric',
            value: '240',
          },
          {
            id: 269,
            label: 'HiraganaKatakana',
            value: '242',
          },
          {
            id: 270,
            label: 'ZenkakuHankaku',
            value: '243',
          },
          {
            id: 271,
            label: 'KanjiMode',
            value: '244',
          },
          {
            id: 272,
            label: '',
            value: '251',
          },
          {
            id: 273,
            label: 'WakeUp',
            value: '255',
          },
        ],
      },
    ],
    alias: 'nhan_phim',
    parent: 15,
  },
  {
    id: 35,
    name: 'Chụp màn hình',
    guildUrl: `${BASE_GUILD_URL}browsers/screenshot.html`,
    keyWord: 'chụp màn hình, screenshot',
    icon: 'fluent-mdl2:browser-tab-screenshot',
    description: 'Chụp ảnh màn hình của tab đang hoạt động',
    script_template: 'await rpa.screenshot(`{{file_name}}`, `{{folder_output}}`)',
    parameters: [
      {
        key: 'file_name',
        type: 'string',
        label: 'File name',
        is_required: true,
      },
      {
        key: 'folder_output',
        type: 'string',
        label: 'Folder output',
        is_required: true,
      },
    ],
    alias: 'chup_man_hinh',
    parent: 14,
  },
  {
    id: 36,
    name: 'Lấy URL',
    guildUrl: `${BASE_GUILD_URL}browsers/get-url.html`,
    keyWord: 'lấy url, get url',
    icon: 'material-symbols:link',
    description: 'Lấy URL của tab đang hoạt động',
    script_template: '{{variable_name}} = await rpa.getUrl();',
    parameters: [
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: true,
      },
    ],
    alias: 'lay_url',
    parent: 14,
  },
  {
    id: 37,
    name: 'Cuộn chuột',
    guildUrl: `${BASE_GUILD_URL}web-interactions/mouse-scroll.html`,
    keyWord: 'cuộn chuột, scroll',
    icon: 'uil:scroll',
    description: 'Cuộn chuột theo tọa độ hoặc phần tử được chọn',
    script_template:
      '{{#if (equal scroll_type "coordinates" )}}\r\nawait rpa.scrollByCoordinate(`{{x_coordinates}}`, `{{y_coordinates}}`, "{{direction}}", `{{speed}}`)\r\n{{else if (equal scroll_type "css_selector")}}\r\nawait rpa.scrollToElementBySelector(`{{{element_selector}}}`, { timeout: `{{timeout}}` })\r\n{{else}}\r\nawait rpa.scrollToElementByXpath(`{{{element_selector}}}`, { timeout: `{{timeout}}` })\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'scroll_type',
        type: 'select_option',
        label: 'Cuộn chuột theo',
        is_required: true,
        default_value: 'coordinates',
        option_values: [
          {
            id: 1,
            label: 'Tọa độ',
            value: 'coordinates',
            component: [
              {
                key: 'direction',
                type: 'select_option',
                label: 'Hướng cuộn',
                is_required: true,
                default_value: 'down',
                option_values: [
                  {
                    id: 1,
                    label: 'Cuộn xuống',
                    value: 'down',
                  },
                  {
                    id: 2,
                    label: 'Cuộn lên',
                    value: 'up',
                  },
                ],
              },
              {
                key: 'x_coordinates',
                type: 'string',
                label: 'Tọa độ X',
                is_required: true,
                default_value: 0,
              },
              {
                key: 'y_coordinates',
                type: 'string',
                label: 'Tọa độ Y',
                is_required: true,
                default_value: 0,
              },
              {
                key: 'speed',
                type: 'number',
                label: 'Tốc độ cuộn',
                is_required: true,
                default_value: 5,
              },
            ],
          },
          {
            id: 2,
            label: 'Css selector',
            value: 'css_selector',
            component: [
              {
                key: 'element_selector',
                type: 'string',
                label: 'Bộ chọn phần tử',
                is_required: true,
              },
              {
                key: 'timeout',
                type: 'number',
                label: 'Thời gian chờ tìm phần tử tối đa (số giây)',
                is_required: true,
                default_value: 30,
              },
            ],
          },
          {
            id: 3,
            label: 'XPath',
            value: 'xpath',
            component: [
              {
                key: 'element_selector',
                type: 'string',
                label: 'Bộ chọn phần tử',
                is_required: true,
              },
              {
                key: 'timeout',
                type: 'number',
                label: 'Thời gian chờ tìm phần tử tối đa',
                is_required: true,
                default_value: 30,
              },
            ],
          },
        ],
      },
    ],
    alias: 'cuon_chuot',
    parent: 15,
  },
  {
    id: 42,
    name: 'Lặp có điều kiện',
    guildUrl: `${BASE_GUILD_URL}control-flow/while-loop.html`,
    keyWord: 'lặp có điều kiện, while loop',
    icon: 'ic:baseline-loop',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'conditions',
        type: 'array',
        label: 'Điều kiện cho vòng lặp',
        is_required: true,
      },
    ],
    alias: 'lap_co_dieu_kien',
    parent: 17,
  },
  {
    id: 43,
    name: 'Lặp dữ liệu',
    guildUrl: `${BASE_GUILD_URL}control-flow/loop-data.html`,
    keyWord: 'lặp dữ liệu, loop data',
    icon: 'mdi:loop',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'loop_id',
        type: 'string',
        label: 'ID của vòng lặp',
        is_required: true,
      },
      {
        key: 'loop_through',
        type: 'string',
        label: 'Loại vòng lặp',
        is_required: false,
      },
      {
        key: 'from',
        type: 'number',
        label: 'Giá trị bắt đầu',
        is_required: false,
      },
      {
        key: 'to',
        type: 'number',
        label: 'Giá trị kết thúc',
        is_required: false,
      },
      {
        key: 'refererce_key',
        type: 'string',
        label: 'Reference key',
        is_required: false,
      },
      {
        key: 'max_loop',
        type: 'number',
        label: 'Số lần lặp tối đa',
        is_required: false,
      },
      {
        key: 'index_start',
        type: 'number',
        label: 'Vị trí bắt đầu',
        is_required: false,
      },
      {
        key: 'resume_workflow',
        type: 'boolean',
        label: 'Resume last workflow',
        is_required: false,
      },
      {
        key: 'reverse_order',
        type: 'boolean',
        label: 'Reverse loop order',
        is_required: false,
      },
      {
        key: 'variable_name',
        type: 'string',
        label: 'Tên biến',
        is_required: false,
      },
      {
        key: 'element_selector',
        type: 'string',
        label: 'Element selector',
        is_required: false,
      },
      {
        key: 'selector_switch',
        type: 'boolean',
        label: 'Đồng bộ thời gian selector',
        is_required: false,
      },
      {
        key: 'selector_timeout',
        type: 'number',
        label: 'Thời gian chờ selector',
        is_required: false,
      },
    ],
    alias: 'lap_du_lieu',
    parent: 17,
  },
  // {
  //   id: 44,
  //   name: 'Lặp phần tử',
  //   keyWord: 'lặp phần tử, loop element',
  //   icon: 'cil:loop',
  //   description: '',
  //   script_template: '',
  //   parameters: [
  //     {
  //       key: 'loop_id',
  //       type: 'string',
  //       label: 'ID của vòng lặp',
  //       is_required: true,
  //     },
  //     {
  //       key: 'type',
  //       type: 'string',
  //       label: 'Selector type',
  //       is_required: false,
  //     },
  //     {
  //       key: 'element_selector',
  //       type: 'string',
  //       label: 'Element selector',
  //       is_required: true,
  //     },
  //     {
  //       key: 'selector_switch',
  //       type: 'boolean',
  //       label: 'Đồng bộ thời gian selector',
  //       is_required: false,
  //     },
  //     {
  //       key: 'selector_timeout',
  //       type: 'number',
  //       label: 'Thời gian chờ selector',
  //       is_required: false,
  //     },
  //     {
  //       key: 'max_loop',
  //       type: 'number',
  //       label: 'Số lần lặp tối đa',
  //       is_required: false,
  //     },
  //     {
  //       key: 'reverse_order',
  //       type: 'boolean',
  //       label: 'Reverse loop order',
  //       is_required: false,
  //     },
  //     {
  //       key: 'action',
  //       type: 'string',
  //       label: 'Load more element',
  //       is_required: false,
  //     },
  //   ],
  //   alias: 'lap_phan_tu',
  //   parent: 17,
  // },
  {
    id: 45,
    name: 'Điểm cuối vòng lặp',
    guildUrl: `${BASE_GUILD_URL}control-flow/loop-end-point.html`,
    keyWord: 'điểm cuối vòng lặp, loop endpoint',
    icon: 'material-symbols:line-end-circle-rounded',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'loop_id',
        type: 'string',
        label: 'ID của vòng lặp',
        is_required: true,
      },
    ],
    alias: 'diem_cuoi_vong_lap',
    parent: 17,
  },
  {
    id: 47,
    name: 'Bộ nhớ tạm',
    keyWord: 'bộ nhớ tạm, clipboard',
    guildUrl: `${BASE_GUILD_URL}clipboard.html`,
    icon: 'solar:clipboard-linear',
    description: 'Thao tác với dữ liệu sao chép được lưu ở bộ nhớ tạm',
    script_template:
      '{{#if (equal action_type "get")}}\r\n{{#if variable_name}}\r\n{{variable_name}} = {{/if}}await rpa.getClipboardText();\r\n{{else}}\r\nawait rpa.insertClipboardText({{is_from_selection}}{{#if (equal is_from_selection false)}}, `{{text}}`{{/if}})\r\n{{/if}}',
    parameters: [
      {
        key: 'action_type',
        type: 'select_option',
        label: 'Loại hành động',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'Lấy dữ liệu',
            value: 'get',
            component: [
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận dữ liệu',
                is_required: false,
              },
            ],
          },
          {
            id: 2,
            label: 'Thêm dữ liệu vào',
            value: 'insert',
            component: [
              {
                key: 'text',
                type: 'textarea',
                label: 'Nội dung văn bản',
                hidden: {
                  condition: 'value === true',
                  depends_on: 'is_from_selection',
                },
                is_required: false,
              },
              {
                key: 'is_from_selection',
                type: 'checkbox',
                label: 'Lấy văn bản đang được bôi đen trên trang',
                default_value: false,
              },
            ],
          },
        ],
      },
    ],
    alias: 'bo_nho_tam',
    parent: 13,
  },
  {
    id: 48,
    name: 'Điều kiện',
    guildUrl: `${BASE_GUILD_URL}control-flow/condition.html`,
    keyWord: 'điều kiện, if',
    icon: 'fluent:branch-16-filled',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'conditions',
        type: 'array',
        label: 'Điều kiện',
        is_required: true,
      },
      {
        key: 'retry',
        type: 'boolean',
        label: 'Thử lại',
        is_required: false,
      },
      {
        key: 'try_for',
        type: 'number',
        label: 'Lần thử',
        is_required: false,
      },
      {
        key: 'timeout',
        type: 'number',
        label: 'Delay',
        is_required: false,
      },
    ],
    alias: 'dieu_kien',
    parent: 17,
  },
  {
    id: 50,
    name: 'Lưu media',
    guildUrl: `${BASE_GUILD_URL}web-interactions/save-assets.html`,
    keyWord: 'lưu media, save asets',
    icon: 'ph:image',
    description: '',
    script_template:
      '{{#if (equal media_type "url")}}\r\nawait downloadFileByUrl(`{{{url_string}}}`, `{{{output_path}}}`{{#if file_name}}, "{{file_name}}" {{/if}})\r\n{{else if (equal media_type "element")}}\r\n{{#if (equal selector_type "xpath")}}\r\nawait downloadFileByXpath("{{{selector}}}", `{{{output_path}}}`, { "timeout": {{timeout}} {{#if file_name}}, "fileName": "{{file_name}}" {{/if}} })\r\n{{else if (equal selector_type "css")}}\r\nawait downloadFileByCssSelector("{{{selector}}}", `{{{output_path}}}`, { "timeout": {{timeout}} {{#if file_name}}, "fileName": "{{file_name}}" {{/if}} })\r\n{{/if}}\r\n{{/if}}',
    parameters: [
      {
        key: 'media_type',
        type: 'select_option',
        label: 'Media lấy từ',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'URL',
            value: 'url',
            component: [
              {
                key: 'url_string',
                type: 'string',
                label: 'URL chứa Media',
                is_required: true,
              },
            ],
          },
          {
            id: 2,
            label: 'Phần tử',
            value: 'element',
            component: [
              {
                key: 'selector_type',
                type: 'select_option',
                label: 'Loại bộ chọn',
                default_value: 'xpath',
                option_values: [
                  {
                    id: 1,
                    label: 'CSS',
                    value: 'css',
                  },
                  {
                    id: 2,
                    label: 'XPATH',
                    value: 'xpath',
                  },
                ],
              },
              {
                key: 'selector',
                type: 'string',
                label: 'Bộ chọn phần tử',
              },
              {
                key: 'timeout',
                type: 'number',
                label: 'Thời gian chờ tìm phần tử tối đa (số giây)',
                is_required: true,
                default_value: 30,
              },
            ],
          },
        ],
      },
      {
        key: 'file_name',
        type: 'string',
        label: 'Tên tệp (Tùy chọn)',
        is_required: false,
      },
      {
        key: 'output_path',
        type: 'folder_path',
        label: 'Đường dẫn lưu trữ',
        is_required: true,
      },
    ],
    alias: 'luu_media',
    parent: 15,
  },
  {
    id: 51,
    name: 'Element exists',
    icon: 'ant-design:aim-outlined',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'type',
        type: 'string',
        label: 'Selector type',
        is_required: false,
      },
      {
        key: 'element_selector',
        type: 'string',
        label: 'Element selector',
        is_required: true,
      },
      {
        key: 'try_for',
        type: 'number',
        label: 'Try for',
        is_required: false,
      },
      {
        key: 'timeout',
        type: 'number',
        label: 'Selector timeout',
        is_required: false,
      },
      {
        key: 'throw_error',
        type: 'boolean',
        label: 'Xuất lỗi nếu không có element',
        is_required: false,
      },
    ],
    alias: 'element_exists',
    parent: 17,
  },
  {
    id: 52,
    name: 'Notification',
    icon: 'basil:notification-on-outline',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'title',
        type: 'string',
        label: 'Title',
        is_required: false,
      },
      {
        key: 'message',
        type: 'string',
        label: 'Message',
        is_required: false,
      },
      {
        key: 'icon',
        type: 'string',
        label: 'Icon URL',
        is_required: false,
      },
      {
        key: 'image',
        type: 'string',
        label: 'Image URL',
        is_required: false,
      },
    ],
    alias: 'notification',
    parent: 13,
  },
  {
    id: 53,
    name: 'Export data',
    icon: 'ph:export',
    description: '',
    script_template: '',
    parameters: [
      {
        key: 'type',
        type: 'string',
        label: 'Data to export',
        is_required: false,
      },
      {
        key: 'file_name',
        type: 'string',
        label: 'File name',
        is_required: false,
      },
      {
        key: 'on_conflict',
        type: 'string',
        label: 'On conflict',
        is_required: false,
      },
      {
        key: 'export_as',
        type: 'string',
        label: 'Export as',
        is_required: false,
      },
      {
        key: 'reference_key',
        type: 'string',
        label: 'File name',
        is_required: false,
      },
      {
        key: 'variable_name',
        type: 'string',
        label: 'Variable name',
        is_required: false,
      },
    ],
    alias: 'export_data',
    parent: 13,
  },
  {
    id: 54,
    name: 'Lấy tài nguyên',
    guildUrl: `${BASE_GUILD_URL}data/get-resource.html`,
    keyWord: 'lấy tài nguyên, get resource',
    icon: 'carbon:software-resource-cluster',
    description: 'Lấy dữ liệu tài nguyên',
    script_template:
      '{{#if variable_name}} {{variable_name}} ={{/if}} await getResource(`{{platform_type}}`)',
    parameters: [
      {
        id: 3,
        key: 'platform_type',
        type: 'select_option',
        label: 'Loại tài nguyên',
        is_required: true,
        default_value: 'facebook',
        option_values: [
          {
            id: 1,
            icon: 'logos:facebook',
            label: 'Facebook',
            value: 'facebook',
          },
          {
            id: 2,
            icon: 'flat-color-icons:google',
            label: 'Google',
            value: 'google',
          },
          {
            id: 3,
            icon: 'skill-icons:instagram',
            label: 'Instagram',
            value: 'google',
          },
          {
            id: 4,
            icon: 'logos:tiktok-icon',
            label: 'Tiktok',
            value: 'tiktok',
          },
          {
            id: 5,
            icon: 'skill-icons:twitter',
            label: 'Twitter',
            value: 'twitter',
          },
          {
            id: 6,
            icon: 'logos:telegram',
            label: 'Telegram',
            value: 'telegram',
          },
        ],
      },
      {
        id: 2,
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
    ],
    alias: 'lay_tai_nguyen',
    parent: 16,
  },
  {
    id: 55,
    name: 'Cập nhật tài nguyên',
    guildUrl: `${BASE_GUILD_URL}data/update-resource.html`,
    keyWord: 'cập nhật tài nguyên, update resource',
    icon: 'mdi:layers-edit',
    description: 'Cập nhật thông tin của tài nguyên',
    script_template:
      'await {{#if is_create_when_not_exists}}updateOrCreateResource{{else}}updateResource{{/if}}("{{platform_type}}", { {{#isDefined uid }}"uid": `{{uid}}`,{{/isDefined}}{{#isDefined username}}"username": `{{username}}`,{{/isDefined}}{{#isDefined password}}"password": `{{password}}`,{{/isDefined}}{{#isDefined two_fa}}"two_fa": `{{two_fa}}`,{{/isDefined}}{{#isDefined email}}"email": `{{email}}`,{{/isDefined}}{{#isDefined pass_email}}"pass_email": `{{pass_email}}`,{{/isDefined}}{{#isDefined token}}"token": `{{token}}`,{{/isDefined}}{{#isDefined cookie}}"cookie": `{{cookie}}`,{{/isDefined}}{{#isDefined mail_recovery}}"mail_recovery": `{{mail_recovery}}`,{{/isDefined}}{{#isDefined phone}}"phone": `{{phone}}`,{{/isDefined}}{{#isDefined status}}"status": `{{status}}`,{{/isDefined}}{{#isDefined activity_log}}"activity_log": `{{activity_log}}`{{/isDefined}} })',
    parameters: [
      {
        id: 1,
        key: 'platform_type',
        type: 'select_option',
        label: 'Loại tài nguyên',
        is_required: true,
        default_value: 'facebook',
        option_values: [
          {
            id: 1,
            icon: 'logos:facebook',
            label: 'Facebook',
            value: 'facebook',
          },
          {
            id: 2,
            icon: 'flat-color-icons:google',
            label: 'Google',
            value: 'google',
          },
          {
            id: 3,
            icon: 'skill-icons:instagram',
            label: 'Instagram',
            value: 'google',
          },
          {
            id: 4,
            icon: 'logos:tiktok-icon',
            label: 'Tiktok',
            value: 'tiktok',
          },
          {
            id: 5,
            icon: 'skill-icons:twitter',
            label: 'Twitter',
            value: 'twitter',
          },
          {
            id: 6,
            icon: 'logos:telegram',
            label: 'Telegram',
            value: 'telegram',
          },
        ],
      },
      {
        id: 2,
        key: 'data',
        keys: [
          'uid',
          'username',
          'password',
          'two_fa',
          'email',
          'pass_email',
          'token',
          'cookie',
          'mail_recovery',
          'phone',
          'status',
          'activity_log',
        ],
        type: 'object',
        label: 'Dữ liệu tài nguyên',
        is_required: false,
      },
      {
        key: 'is_create_when_not_exists',
        type: 'checkbox',
        label: 'Tạo tài nguyên nếu chưa tồn tại',
        is_required: false,
        default_value: false,
      },
    ],
    alias: 'cap_nhat_tai_nguyen',
    parent: 16,
  },
  {
    id: 56,
    name: 'Chạy mã Javascript',
    guildUrl: `${BASE_GUILD_URL}browsers/excute-js.html`,
    keyWord: 'chạy mã javascript, run javascript',
    icon: 'ri:code-box-line',
    description: 'Thực thi mã Javascript trên trang đang hoạt động',
    script_template:
      '{{#if variable_name}} {{variable_name}} = {{/if}}await rpa.tryExecuteJS(`{{{ escapeSpecialChars script }}}`)',
    parameters: [
      {
        id: 1,
        key: 'script',
        type: 'script_editor',
        label: 'Mã Javascript',
        is_required: true,
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: false,
      },
    ],
    alias: 'chay_ma_javascript',
    parent: 14,
  },
  {
    id: 57,
    name: 'Cookies',
    guildUrl: `${BASE_GUILD_URL}browsers/cookies.html`,
    keyWord: 'cookies',
    icon: 'fluent:cookies-16-filled',
    description: 'Thao tác với cookies: nhập cookie, xuất cookie, xóa cookie',
    script_template:
      '{{#if (equal action_type "clear")}}\r\nawait rpa.clearCookies()\r\n{{else if (equal action_type "import")}}\r\nawait rpa.importCookie(`{{{cookie_str}}}`)\r\n{{else}}\r\n{{variable_name}} = await rpa.getCookies()\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'action_type',
        type: 'select_option',
        label: 'Hành động',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'Nhập',
            value: 'import',
            component: [
              {
                id: 1,
                key: 'cookie_str',
                type: 'string',
                label: 'Chuỗi cookie',
                is_required: true,
              },
            ],
          },
          {
            id: 2,
            label: 'Xuất',
            value: 'export',
            component: [
              {
                id: 1,
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 3,
            label: 'Xóa',
            value: 'clear',
          },
        ],
      },
    ],
    alias: 'cookies',
    parent: 14,
  },
  {
    id: 58,
    name: 'Lấy nội dung HTML',
    guildUrl: `${BASE_GUILD_URL}browsers/get-page-content.html`,
    keyWord: 'lấy nội dung html, get html content',
    icon: 'fluent:content-view-24-regular',
    description: 'Lấy đầy đủ nội dung HTML của trang web',
    script_template: '{{variable_name}} = await rpa.getDomContent()',
    parameters: [
      {
        id: 1,
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
    ],
    alias: 'lay_noi_dung_html',
    parent: 14,
  },
  {
    id: 59,
    name: 'Lấy mã OTP 2FA',
    keyWord: 'lấy mã otp 2fa, get otp 2fa',
    icon: 'teenyicons:otp-outline',
    description: 'Lấy mã OTP từ mã 2FA',
    script_template: '{{variable_name}} = convert2FaOTP(`{{two_fa}}`)',
    parameters: [
      {
        id: 1,
        key: 'two_fa',
        type: 'string',
        label: 'Mã 2FA',
        is_required: true,
      },
      {
        id: 2,
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
    ],
    alias: 'lay_ma_otp_2fa',
    parent: 62,
  },
  {
    id: 60,
    name: 'Chờ tải trang',
    guildUrl: `${BASE_GUILD_URL}browsers/await-page-loading.html`,
    keyWord: 'chờ tải trang, wait for navigation',
    icon: 'carbon:condition-wait-point',
    description: 'Chờ tải trang đến sự kiện được chỉ định phát ra',
    script_template: 'await rpa.waitForNavigation("{{wait_until}}", `{{timeout}}`)',
    parameters: [
      {
        id: 1,
        key: 'wait_until',
        type: 'select_option',
        label: 'Đợi đến khi sự kiện được kích hoạt',
        is_required: true,
        default_value: 'load',
        option_values: [
          {
            id: 1,
            label: 'load',
            value: 'load',
          },
          {
            id: 2,
            label: 'domcontentloaded',
            value: 'domcontentloaded',
          },
          {
            id: 3,
            label: 'networkidle0',
            value: 'networkidle0',
          },
          {
            id: 4,
            label: 'networkidle2',
            value: 'networkidle2',
          },
        ],
      },
      {
        id: 2,
        key: 'timeout',
        type: 'number',
        label: 'Thời gian chờ tối đa (số giây)',
        is_required: true,
        default_value: 30,
      },
    ],
    alias: 'cho_tai_trang',
    parent: 14,
  },
  {
    id: 61,
    name: 'Dừng vòng lặp',
    guildUrl: `${BASE_GUILD_URL}control-flow/break-loop.html`,
    keyWord: 'dừng vòng lặp, stop loop, break loop',
    icon: 'f7:forward-end-fill',
    description: '',
    script_template: 'showLogRunTask("Dừng vòng lặp");\r\nbreak;',
    parameters: null,
    alias: 'dung_vong_lap',
    parent: 17,
  },
  {
    id: 62,
    name: 'API',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },
  {
    id: 63,
    name: 'Ghi tệp',
    keyWord: 'ghi tệp, write file',
    icon: 'jam:write-f',
    description: 'Ghi dữ liệu vào tệp',
    script_template:
      '{{#if (equal write_mode "owrite") }}\r\nawait writeFile("{{file_path}}", `{{input_data}}`)\r\n{{else}}\r\n{{#if (equal append_type "new_line")}}\r\nawait appendFile("{{file_path}}", `{{input_data}}`)\r\n{{else}}\r\nawait appendFile("{{file_path}}", `{{input_data}}`, "{{delimiter}}")\r\n{{/if}}\r\n{{/if}}',
    parameters: [
      {
        key: 'file_path',
        type: 'choose_file',
        label: 'Đường dẫn tệp',
        is_required: true,
      },
      {
        key: 'input_data',
        type: 'textarea',
        label: 'Nội dung',
        is_required: true,
      },
      {
        key: 'write_mode',
        type: 'select_option',
        label: 'Chế độ ghi',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'Ghi đè',
            value: 'owrite',
          },
          {
            id: 2,
            label: 'Thêm vào',
            value: 'append',
            component: [
              {
                key: 'append_type',
                type: 'select_option',
                label: 'Kiểu thêm',
                default_value: 'new_line',
                option_values: [
                  {
                    id: 1,
                    label: 'Dòng mới',
                    value: 'new_line',
                  },
                  {
                    id: 2,
                    label: 'Cùng 1 dòng',
                    value: 'same_line',
                    component: [
                      {
                        key: 'delimiter',
                        type: 'string',
                        label: 'Dấu phân cách',
                        is_required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    alias: 'ghi_tep',
    parent: 18,
  },
  {
    id: 64,
    name: 'Xóa tệp',
    keyWord: 'xóa tệp, delete file',
    icon: 'lucide:file-x',
    description: 'Xóa tệp được chỉ định',
    script_template: 'await deleteFile("{{file_path}}")',
    parameters: [
      {
        key: 'file_path',
        type: 'choose_file',
        label: 'Đường dẫn tệp',
        is_required: true,
      },
    ],
    alias: 'xoa_tep',
    parent: 18,
  },
  {
    id: 65,
    name: 'Đọc tệp txt',
    keyWord: 'đọc tệp txt, read file txt',
    icon: 'bxs:file-txt',
    description: 'Đọc tệp có định dạng txt',
    script_template:
      '{{#if (equal mode "one_line")}}\r\n{{#if (equal line_position "random")}}\r\n{{#if variable_name}} {{variable_name}} = {{/if}}await F_popRandomLine(`{{file_path}}`, {{is_delete_after_read}})\r\n{{else if (equal line_position "first")}}\r\n{{#if variable_name}} {{variable_name}} = {{/if}}await F_shiftLine(`{{file_path}}`, {{is_delete_after_read}})\r\n{{else}}\r\n{{#if variable_name}} {{variable_name}} = {{/if}}await F_popLine(`{{file_path}}`, {{is_delete_after_read}})\r\n{{/if}}\r\n{{else}}\r\n{{#if variable_name}} {{variable_name}} = {{/if}}await readLines(`{{file_path}}`)\r\n{{/if}}',
    parameters: [
      {
        key: 'file_path',
        type: 'choose_file',
        label: 'Đường dẫn tệp',
        is_required: true,
      },
      {
        key: 'mode',
        type: 'select_option',
        label: 'Chế độ đọc',
        is_required: true,
        default_value: 'one_line',
        option_values: [
          {
            id: 1,
            label: 'Đọc một dòng',
            value: 'one_line',
            component: [
              {
                key: 'line_position',
                type: 'select_option',
                label: 'Vị trí dòng đọc',
                is_required: true,
                default_value: 'random',
                option_values: [
                  {
                    id: 1,
                    label: 'Ngẫu nhiên',
                    value: 'random',
                  },
                  {
                    id: 2,
                    label: 'Đầu tiên',
                    value: 'first',
                  },
                  {
                    id: 3,
                    label: 'Cuối cùng',
                    value: 'last',
                  },
                ],
              },
              {
                key: 'is_delete_after_read',
                type: 'checkbox',
                label: 'Xóa dòng sau khi đọc',
                default_value: 'true',
              },
            ],
          },
          {
            id: 2,
            label: 'Đọc tất cả',
            value: 'all_line',
          },
        ],
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: true,
      },
    ],
    alias: 'doc_tep_txt',
    parent: 18,
  },
  {
    id: 66,
    name: 'Chuyển Frame',
    guildUrl: `${BASE_GUILD_URL}browsers/switch-frame.html`,
    keyWord: 'chuyển frame, switch frame, switch iframe',
    icon: 'mdi:iframe-export-outline',
    description: 'Chuyển Frame được chỉ định',
    script_template:
      '{{#if (equal frame_type "sub")}}\r\n{{#if (equal choose_type "url")}}\r\nrpa.F_swithToFrameByUrl(`{{url_char}}`)\r\n{{else if (equal choose_type "order")}}\r\nrpa.switchToFrameByOrderNumber(`{{order_val}}`)\r\n{{else}}\r\n{{#if (equal selector_type "css")}}\r\n await rpa.switchToFrameBySelector(`{{{selector_val}}}`)\r\n{{else}}\r\nrpa.switchToFrameByXpath(`{{{selector_val}}}`)\r\n{{/if}}\r\n{{/if}}\r\n{{else}}\r\nrpa.F_switchToMainFrame()\r\n{{/if}}',
    parameters: [
      {
        key: 'frame_type',
        type: 'select_option',
        label: 'Loại Frame',
        is_required: true,
        default_value: 'sub',
        option_values: [
          {
            id: 1,
            label: 'Frame phụ',
            value: 'sub',
            component: [
              {
                key: 'choose_type',
                type: 'select_option',
                label: 'Kiểu chọn',
                is_required: true,
                default_value: 'url',
                option_values: [
                  {
                    id: 1,
                    label: 'URL',
                    value: 'url',
                    component: [
                      {
                        key: 'url_char',
                        type: 'string',
                        label: 'Chuỗi URL',
                        is_required: true,
                      },
                    ],
                  },
                  {
                    id: 2,
                    label: 'Thứ tự',
                    value: 'order',
                    component: [
                      {
                        key: 'order_val',
                        type: 'number',
                        label: 'Số thứ tự',
                        is_required: true,
                        default_value: 1,
                      },
                    ],
                  },
                  {
                    id: 3,
                    label: 'Selector',
                    value: 'selector',
                    component: [
                      {
                        key: 'selector_type',
                        type: 'select_option',
                        label: 'Loại selector',
                        is_required: true,
                        default_value: 'css',
                        option_values: [
                          {
                            id: 1,
                            label: 'CSS',
                            value: 'css',
                          },
                          {
                            id: 2,
                            label: 'Xpath',
                            value: 'xpath',
                          },
                        ],
                      },
                      {
                        key: 'selector_val',
                        type: 'string',
                        label: 'Bộ chọn',
                        is_required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 2,
            label: 'Frame chính',
            value: 'main',
          },
        ],
      },
    ],
    alias: 'chuyen_frame',
    parent: 14,
  },
  {
    id: 67,
    name: 'Đóng trình duyệt',
    guildUrl: `${BASE_GUILD_URL}browsers/close-browser.html`,
    keyWord: 'đóng trình duyệt, close browser',
    icon: 'ci:close-square',
    description: 'Đóng cửa sổ trình duyệt',
    script_template: 'await rpa.closeBrowser();\r\nreturn;',
    parameters: null,
    alias: 'dong_trinh_duyet',
    parent: 14,
  },
  {
    id: 68,
    name: 'Ngẫu nhiên',
    guildUrl: `${BASE_GUILD_URL}data/random.html`,
    keyWord: 'ngẫu nhiên, random',
    icon: 'game-icons:perspective-dice-six-faces-random',
    description: 'Tạo dữ liệu ngẫu nhiên',
    script_template:
      '{{#if (equal random_type "number")}}\r\n{{variable_name}} = getRandomNumber(`{{min}}`, `{{max}}`)\r\n{{else}}\r\n{{variable_name}} = getStringRandom(`{{length}}`, { hasUpperCase: {{has_upper_case}}, hasLowerCase: {{has_lower_case}}, hasNumber: {{has_number}}, hasSpecial: {{has_special}} })\r\n{{/if}}',
    parameters: [
      {
        key: 'random_type',
        type: 'select_option',
        label: 'Loại dữ liệu',
        is_required: true,
        default_value: 'number',
        option_values: [
          {
            id: 1,
            label: 'Số',
            value: 'number',
            component: [
              {
                key: 'min',
                type: 'number',
                label: 'Số tối thiểu',
                is_required: true,
                default_value: 0,
              },
              {
                key: 'max',
                type: 'number',
                label: 'Số tối đa',
                is_required: true,
                default_value: 10,
              },
            ],
          },
          {
            id: 2,
            label: 'Chuỗi ký tự',
            value: 'string',
            component: [
              {
                key: 'length',
                type: 'number',
                label: 'Độ dài',
                is_required: true,
                default_value: 10,
              },
              {
                key: 'has_upper_case',
                type: 'checkbox',
                label: 'A-Z',
                is_required: true,
                default_value: true,
              },
              {
                key: 'has_lower_case',
                type: 'checkbox',
                label: 'a-z',
                is_required: true,
                default_value: true,
              },
              {
                key: 'has_number',
                type: 'checkbox',
                label: '0-9',
                is_required: true,
                default_value: true,
              },
              {
                key: 'has_special',
                type: 'checkbox',
                label: 'Ký tự đặc biệt',
                is_required: true,
                default_value: false,
              },
            ],
          },
        ],
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: true,
      },
    ],
    alias: 'ngau_nhien',
    parent: 16,
  },
  {
    id: 69,
    name: 'Tiếp tục vòng lặp',
    guildUrl: `${BASE_GUILD_URL}control-flow/continue-loop.html`,
    keyWord: 'tiếp tục vòng lặp, continue loop',
    icon: 'ion:play-forward-sharp',
    description: 'Bỏ qua các bước tiếp theo và tiếp tục vòng lặp mới',
    script_template:
      'showLogRunTask("Bỏ qua phần còn lại của lần lặp hiện tại và chuyển sang lần lặp kế tiếp của vòng lặp");\r\ncontinue;',
    parameters: null,
    alias: 'tiep_tuc_vong_lap',
    parent: 17,
  },
  {
    id: 70,
    name: 'Đọc thư mục',
    keyWord: 'đọc thư mục, read folder',
    icon: 'heroicons:folder-solid',
    description: 'Lấy tất cả đường dẫn của tệp trong thư mục',
    script_template:
      '{{variable_name}} = F_getAllFiles("{{folder_path}}", {{include_subdirectories}})',
    parameters: [
      {
        key: 'folder_path',
        type: 'string',
        label: 'Đường dẫn thư mục',
        is_required: true,
      },
      {
        key: 'include_subdirectories',
        type: 'checkbox',
        label: 'Bao gồm thư mục con',
        default_value: false,
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
    ],
    alias: 'doc_thu_muc',
    parent: 18,
  },
  {
    id: 71,
    name: 'Xử lý biến',
    guildUrl: `${BASE_GUILD_URL}data/handle-variable.html`,
    keyWord: 'xử lý biến, variable handle',
    icon: 'fluent:braces-variable-20-filled',
    description: 'Xử lý giá trị của biến',
    script_template:
      '{{#if (equal data_type "string")}}\r\n  {{#if (equal method "length")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "length")\r\n  {{else if (equal method "to_upper_case")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "toUpperCase")\r\n  {{else if (equal method "to_lower_case")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "toLowerCase")\r\n  {{else if (equal method "trim")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "trim")\r\n  {{else if (equal method "substring")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "substring", ["{{start}}" {{#if end}} , "{{end}}" {{/if}}])\r\n  {{else if (equal method "replace")}}\r\n  {{#if replace_all}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "replaceAll", ["{{search_value}}", "{{new_value}}"])\r\n  {{else}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "replace", ["{{search_value}}", "{{new_value}}"])\r\n  {{/if}}\r\n  {{else if (equal method "split")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "split", ["{{separator}}"])\r\n  {{else if (equal method "concat")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "concat", [{{{json strings}}}])\r\n  {{else if (equal method "json_parse")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "json_parse")\r\n  {{/if}}\r\n{{else if (equal data_type "array")}}\r\n  {{#if (equal method "length")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "list_length")\r\n  {{else if (equal method "get_item_random")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "list_get_item_random")\r\n  {{else if (equal method "get_item_by_order_number")}}\r\n  {{variable_output}} =  handleVariableProxy({{variable}}, "{{variable}}", "list_get_item_by_order_number", ["{{order_number}}"])\r\n  {{else if (equal method "shuffle")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "list_shuffle")\r\n  {{else if (equal method "slice")}}\r\n  {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "list_slice", ["{{start}}" {{#if end}} , "{{end}}" {{/if}}])\r\n  {{/if}}\r\n{{else if (equal data_type "object")}}\r\n{{#if (equal method "get_property")}}\r\n    {{variable_output}} = handleVariableProxy({{variable}}, "{{variable}}", "object_get_property", ["{{path}}", {{is_return_default}}, "{{default_data_type}}", "{{default_value}}", `{{{custom_value}}}`])\r\n{{/if}}\r\n{{/if}}',
    parameters: [
      {
        key: 'variable',
        type: 'select_variable',
        label: 'Biến chứa dữ liệu',
        is_required: true,
      },
      {
        key: 'data_type',
        type: 'select_option',
        label: 'Loại dữ liệu',
        default_value: 'string',
        option_values: [
          {
            id: 1,
            label: 'Chuỗi ký tự',
            value: 'string',
            component: [
              {
                key: 'method',
                type: 'select_option',
                label: 'Phương thức',
                default_value: 'length',
                option_values: [
                  {
                    id: 1,
                    label: 'Lấy độ dài',
                    value: 'length',
                  },
                  {
                    id: 2,
                    label: 'Chuyển thành chữ in hoa',
                    value: 'to_upper_case',
                  },
                  {
                    id: 3,
                    label: 'Chuyển thành chữ thường',
                    value: 'to_lower_case',
                  },
                  {
                    id: 4,
                    label: 'Loại bỏ khoảng trắng ở đầu và cuối chuỗi',
                    value: 'trim',
                  },
                  {
                    id: 5,
                    label: 'Lấy một phần của chuỗi',
                    value: 'substring',
                    component: [
                      {
                        key: 'start',
                        type: 'number',
                        label: 'Vị trí bắt đầu',
                        is_required: true,
                      },
                      {
                        key: 'end',
                        type: 'number',
                        label: 'Vị trí kết thúc',
                        is_required: false,
                      },
                    ],
                  },
                  {
                    id: 6,
                    label: 'Thay thế chuỗi',
                    value: 'replace',
                    component: [
                      {
                        key: 'search_value',
                        type: 'string',
                        label: 'Chuỗi cần thay thế',
                      },
                      {
                        key: 'new_value',
                        type: 'string',
                        label: 'Chuỗi được thay thế',
                      },
                      {
                        key: 'replace_all',
                        type: 'checkbox',
                        label: 'Thay thế tất cả',
                        default_value: false,
                      },
                    ],
                  },
                  {
                    id: 7,
                    label: 'Tách chuỗi',
                    value: 'split',
                    component: [
                      {
                        key: 'separator',
                        type: 'string',
                        label: 'Ký tự phân tách',
                      },
                    ],
                  },
                  {
                    id: 8,
                    label: 'Nối chuỗi',
                    value: 'concat',
                    component: [
                      {
                        key: 'strings',
                        type: 'array',
                        label: 'Danh sách chuỗi',
                      },
                    ],
                  },
                  {
                    id: 9,
                    label: 'Chuyển JSON String sang Javascript Object',
                    value: 'json_parse',
                  },
                ],
              },
            ],
          },
          {
            id: 2,
            label: 'Danh sách',
            value: 'array',
            component: [
              {
                key: 'method',
                type: 'select_option',
                label: 'Phương thức',
                default_value: 'length',
                option_values: [
                  {
                    id: 1,
                    label: 'Lấy độ dài',
                    value: 'length',
                  },
                  {
                    id: 2,
                    label: 'Lấy phần tử ngẫu nhiên',
                    value: 'get_item_random',
                  },
                  {
                    id: 3,
                    label: 'Lấy phần tử theo thứ tự',
                    value: 'get_item_by_order_number',
                    component: [
                      {
                        key: 'order_number',
                        type: 'number',
                        label: 'Số thứ tự',
                      },
                    ],
                  },
                  {
                    id: 4,
                    label: 'Xáo trộn',
                    value: 'shuffle',
                  },
                  {
                    id: 5,
                    label: 'Lấy một phần của danh sách',
                    value: 'slice',
                    component: [
                      {
                        key: 'start',
                        type: 'number',
                        label: 'Vị trí bắt đầu',
                        is_required: true,
                      },
                      {
                        key: 'end',
                        type: 'number',
                        label: 'Vị trí kết thúc',
                        is_required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 3,
            label: 'Đối tượng',
            value: 'object',
            component: [
              {
                key: 'method',
                type: 'select_option',
                label: 'Phương thức',
                option_values: [
                  {
                    id: 1,
                    label: 'Lấy thuộc tính',
                    value: 'get_property',
                    component: [
                      {
                        key: 'path',
                        type: 'string',
                        label: 'Đường dẫn đến thuộc tính',
                      },
                      {
                        key: 'is_return_default',
                        type: 'checkbox',
                        label: 'Trả về giá trị mặc định nếu không tìm thấy thuộc tính',
                        component: [
                          {
                            key: 'default_data_type',
                            type: 'select_option',
                            label: 'Kiểu dữ liệu',
                            option_values: [
                              {
                                id: 1,
                                label: 'Text',
                                value: 'string',
                                component: [
                                  {
                                    key: 'default_value',
                                    type: 'select_option',
                                    label: 'Giá trị',
                                    option_values: [
                                      {
                                        id: 1,
                                        label: 'Chuỗi rỗng',
                                        value: 'empty_string',
                                      },
                                      {
                                        id: 2,
                                        label: 'Tùy chỉnh',
                                        value: 'custom',
                                        component: [
                                          {
                                            key: 'custom_value',
                                            type: 'string',
                                            label: 'Giá trị tùy chỉnh',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                id: 2,
                                label: 'Number',
                                value: 'number',
                                component: [
                                  {
                                    key: 'custom_value',
                                    type: 'number',
                                    label: 'Giá trị',
                                  },
                                ],
                              },
                              {
                                id: 3,
                                label: 'Object',
                                value: 'object',
                                component: [
                                  {
                                    key: 'default_value',
                                    type: 'select_option',
                                    label: 'Giá trị',
                                    option_values: [
                                      {
                                        id: 1,
                                        label: 'Đối tượng rỗng',
                                        value: 'empty_object',
                                      },
                                      {
                                        id: 2,
                                        label: 'Tùy chỉnh',
                                        value: 'custom',
                                        component: [
                                          {
                                            key: 'custom_value',
                                            type: 'json_editor',
                                            label: 'Giá trị tùy chỉnh',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                id: 4,
                                label: 'List',
                                value: 'list',
                                component: [
                                  {
                                    key: 'default_value',
                                    type: 'select_option',
                                    label: 'Giá trị',
                                    option_values: [
                                      {
                                        id: 1,
                                        label: 'Danh sách rỗng',
                                        value: 'empty_list',
                                      },
                                      {
                                        id: 2,
                                        label: 'Tùy chỉnh',
                                        value: 'custom',
                                        component: [
                                          {
                                            key: 'custom_value',
                                            type: 'json_editor',
                                            label: 'Giá trị tùy chỉnh',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        default_value: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        key: 'variable_output',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: true,
      },
    ],
    alias: 'xu_ly_bien',
    parent: 16,
  },
  {
    id: 72,
    name: 'Dữ liệu phần tử',
    keyWord: 'dữ liệu phần tử, element data',
    icon: 'mdi:square-brackets',
    description: 'Lấy các dữ liệu về phần tử',
    script_template:
      '{{#if (equal selector_type "xpath")}}\r\n{{variable_name}} = await rpa.getDataElementByXpath(`{{{selector}}}`, {{{json data_types}}}, `{{{data_path}}}`, `{{timeout}}`)\r\n{{else if (equal selector_type "css")}}\r\n{{variable_name}} = await rpa.getDataElementByCssSelector(`{{{selector}}}`, {{{json data_types}}}, `{{{data_path}}}`, `{{timeout}}`)\r\n{{/if}}',
    parameters: [
      {
        key: 'selector_type',
        type: 'select_option',
        label: 'Loại bộ chọn',
        is_required: true,
        default_value: 'xpath',
        option_values: [
          {
            id: 1,
            label: 'Xpath',
            value: 'xpath',
          },
          {
            id: 2,
            label: 'CSS',
            value: 'css',
          },
        ],
      },
      {
        key: 'selector',
        type: 'string',
        label: 'Bộ chọn của phần tử',
        is_required: true,
      },
      {
        key: 'data_types',
        type: 'select_multiple_option',
        label: 'Dữ liệu cần lấy',
        is_required: 'true',
        option_values: [
          {
            id: 1,
            label: 'Vị trí',
            value: 'position',
          },
          {
            id: 2,
            label: 'Kích thước',
            value: 'size',
          },
          {
            id: 3,
            label: 'Thuộc tính',
            value: 'attribute',
          },
        ],
      },
      {
        key: 'data_path',
        type: 'string',
        label: 'Data Path',
        is_required: false,
        default_value: '',
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
      {
        key: 'timeout',
        type: 'number',
        label: 'Thời gian chờ tìm phần tử (số giây)',
        is_required: true,
        default_value: 30,
      },
    ],
    alias: 'du_lieu_phan_tu',
    parent: 16,
  },
  {
    id: 73,
    name: 'Tải tệp lên',
    guildUrl: `${BASE_GUILD_URL}web-interactions/upload-file.html`,
    keyWord: 'tải tệp lên, file upload',
    icon: 'flowbite:upload-outline',
    description: 'Tải tệp lên trang web',
    script_template:
      '{{#if is_upload_folder}}\r\n  {{#if (equal selector_type "xpath")}}\r\n  await rpa.uploadFileInFolderByXpath(`{{{selector}}}`, `{{path}}`, { type: {{#if is_upload_by_dialog}}"dialog"{{else}}"direct"{{/if}}, timeout: `{{timeout}}`, numberFile: `{{num_file}}` })\r\n  {{else if (equal selector_type "css")}}\r\n  await rpa.uploadFileInFolderByCssSelector(`{{{selector}}}`, `{{path}}`, { type: {{#if is_upload_by_dialog}}"dialog"{{else}}"direct"{{/if}}, timeout: `{{timeout}}`, numberFile: `{{num_file}}` })\r\n  {{/if}}\r\n{{else}}\r\n  {{#if (equal selector_type "xpath")}}\r\n  await rpa.F_uploadFileByXpath(`{{{selector}}}`, `{{path}}`, { type: {{#if is_upload_by_dialog}}"dialog"{{else}}"direct"{{/if}}, timeout: `{{timeout}}` })\r\n  {{else if (equal selector_type "css")}}\r\n  await rpa.uploadFileByCssSelector(`{{{selector}}}`, `{{path}}`, { type: {{#if is_upload_by_dialog}}"dialog"{{else}}"direct"{{/if}}, timeout: `{{timeout}}` })\r\n  {{/if}}\r\n{{/if}}',
    parameters: [
      {
        key: 'selector_type',
        type: 'select_option',
        label: 'Loại bộ chọn',
        is_required: true,
        default_value: 'xpath',
        option_values: [
          {
            id: 1,
            label: 'Xpath',
            value: 'xpath',
          },
          {
            id: 2,
            label: 'CSS',
            value: 'css',
          },
        ],
      },
      {
        key: 'selector',
        type: 'string',
        label: 'Bộ chọn của phần tử',
        is_required: true,
      },
      {
        key: 'is_upload_folder',
        type: 'checkbox',
        label: 'Tải tệp trong thư mục',
        component: [
          {
            key: 'path',
            type: 'choose_folder',
            label: 'Đường thư mục',
            is_required: true,
          },
          {
            key: 'num_file',
            note: 'Nếu không nhập số lượng tệp thì sẽ tải lên tất cả các tệp trong thư mục, nếu có sẽ tải lên ngẫu theo số lượng tệp',
            type: 'number',
            label: 'Số lượng tệp tải lên',
            is_required: false,
            default_value: null,
          },
        ],
        default_value: false,
      },
      {
        key: 'path',
        type: 'choose_file',
        label: 'Đường dẫn tệp',
        is_required: true,
      },
      {
        key: 'is_upload_by_dialog',
        type: 'checkbox',
        label: 'Tải lên bằng dialog',
        default_value: false,
      },
      {
        key: 'timeout',
        type: 'number',
        label: 'Thời gian chờ tìm phần tử tối đa (số giây)',
        is_required: true,
        default_value: 30,
      },
    ],
    alias: 'tai_tep_len',
    parent: 15,
  },
  {
    id: 74,
    name: 'Gán biến',
    guildUrl: `${BASE_GUILD_URL}data/assign-variable.html`,
    keyWord: 'gán biến, assign variable',
    icon: 'fluent:braces-variable-20-filled',
    description: 'Gán biến với nhiều toán tử',
    script_template:
      '{{#contains value_two "$"}}\r\n{{variable_name}} = applyOperation({{variable_name}}, `{{{operator}}}`, `{{{value_two}}}`, "{{variable_name}}")\r\n{{else}}\r\n{{variable_name}} = applyOperation({{variable_name}}, `{{{operator}}}`, {{{value_two}}}, "{{variable_name}}")\r\n{{/contains}}\r\n',
    parameters: [
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến',
        is_required: true,
      },
      {
        key: 'operator',
        type: 'select_option',
        label: 'Toán tử',
        is_required: true,
        default_value: '=',
        option_values: [
          {
            id: 1,
            label: '=',
            value: '=',
          },
          {
            id: 2,
            label: '+',
            value: '+',
          },
          {
            id: 3,
            label: '-',
            value: '-',
          },
          {
            id: 4,
            label: '*',
            value: '*',
          },
          {
            id: 5,
            label: '/',
            value: '/',
          },
        ],
      },
      {
        key: 'value_two',
        type: 'string',
        label: 'Giá trị',
        is_required: true,
      },
    ],
    alias: 'gan_bien',
    parent: 16,
  },
  {
    id: 75,
    name: 'Lấy Thời Gian',
    keyWord: 'lấy thời gian, get time',
    icon: 'mingcute:time-line',
    description: 'Lấy thông tin thời gian ở thời điểm hiện tại',
    script_template: '{{ variable_name }} = getTime("{{format_return}}")',
    parameters: [
      {
        key: 'format_return',
        type: 'select_option',
        label: 'Định dạng trả về',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'Timestamp',
            value: 'timestamp',
          },
          {
            id: 2,
            label: 'DD/MM/YYYY',
            value: 'DD_MM_YYYY',
          },
          {
            id: 3,
            label: 'DD/MM/YYYY HH:mm:ss',
            value: 'DD_MM_YYYY_HH_mm_ss',
          },
          {
            id: 4,
            label: 'YYYY-MM-DD',
            value: 'YYYY_MM_DD',
          },
          {
            id: 5,
            label: 'YYYY-MM-DD HH:mm:ss',
            value: 'YYYY_MM_DD_HH_mm_ss',
          },
          {
            id: 6,
            label: 'HH:mm:ss',
            value: 'HH_mm_ss',
          },
        ],
      },
      {
        key: 'variable_name',
        type: 'select_variable',
        label: 'Biến nhận dữ liệu',
        is_required: false,
      },
    ],
    alias: 'lay_thoi_gian',
    parent: 13,
  },
  {
    id: 76,
    name: 'Di chuyển chuột',
    guildUrl: `${BASE_GUILD_URL}web-interactions/mouse-move.html`,
    keyWord: 'di chuyển chuột, mouse movement',
    icon: 'hugeicons:move-02',
    description: 'Di chuyển chuột đến phần tử hoặc tọa độ chỉ định',
    script_template:
      "{{#if (equal target 'element')}}\r\n{{#if (equal selector_type 'xpath' )}}\r\nawait rpa.F_mouseMoveXpath(`{{{selector}}}`, `{{timeout}}`)\r\n{{ else if (equal selector_type 'css') }}\r\nawait rpa.F_mouseMoveSelector(`{{{selector}}}`, `{{timeout}}`)\r\n{{/if}}\r\n{{ else if (equal target 'coordinates')}}\r\nawait rpa.mouseMove(`{{x_coordinates}}`, `{{y_coordinates}}`)\r\n{{/if}}",
    parameters: [
      {
        key: 'target',
        type: 'select_option',
        label: 'Đích di chuyển',
        is_required: 'true',
        default_value: 'element',
        option_values: [
          {
            id: 1,
            label: 'Phần tử',
            value: 'element',
            component: [
              {
                key: 'selector_type',
                type: 'select_option',
                label: 'Loại bộ chọn',
                is_required: true,
                default_value: 'xpath',
                option_values: [
                  {
                    id: 1,
                    label: 'CSS',
                    value: 'css',
                  },
                  {
                    id: 2,
                    label: 'Xpath',
                    value: 'xpath',
                  },
                ],
              },
              {
                key: 'selector',
                type: 'string',
                label: 'Bộ chọn của phần tử',
                is_required: true,
              },
              {
                key: 'timeout',
                type: 'number',
                label: 'Thời gian chờ tối đa (đơn vị giây)',
                is_required: false,
                default_value: 10,
              },
            ],
          },
          {
            id: 2,
            label: 'Tọa độ',
            value: 'coordinates',
            component: [
              {
                key: 'x_coordinates',
                type: 'number',
                label: 'Tọa độ X',
                is_required: true,
                default_value: 0,
              },
              {
                key: 'y_coordinates',
                type: 'number',
                label: 'Tọa độ Y',
                is_required: true,
                default_value: 0,
              },
            ],
          },
        ],
      },
    ],
    alias: 'di_chuyen_chuot',
    parent: 15,
  },
  {
    id: 77,
    name: 'Log',
    keyWord: 'log',
    icon: 'fluent-mdl2:collapse-content-single',
    description: 'In ra cửa sổ nhật ký các giá trị ở dạng string, number hay object',
    script_template: 'logConsole("{{{message}}}", {{{json args}}})',
    parameters: [
      {
        key: 'message',
        type: 'string',
        label: 'Nội dung hiển thị',
        is_required: true,
      },
      {
        key: 'args',
        type: 'custom',
        label: '',
        is_required: false,
      },
    ],
    alias: 'log',
    parent: 13,
  },
  {
    id: 78,
    name: 'Facebook API',
    keyWord: 'facebook api',
    icon: 'ic:baseline-facebook',
    description: 'Sử dụng các API có sẵn của Facebook',
    script_template:
      '{{#if (equal api_type "changeLanguage")}}\r\nawait fbAPI.changeLanguage(`{{lang}}`);\r\n{{else if (equal api_type "switchProfilePage")}}\r\n{{#if profile_id}}\r\nawait fbAPI.switchProfilePage(`{{profile_id}}`);\r\n{{else}}\r\nawait fbAPI.switchProfilePage();\r\n{{/if}}\r\n{{else if (equal api_type "getCurrentUserData")}}\r\n{{variable_name}} = await fbAPI.getCurrentUserData()\r\n{{else if (equal api_type "fetchReelPosts")}}\r\n{{variable_name}} = await fbAPI.fetchReelPosts(`{{max_post}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}` {{/if}} });\r\n{{else if (equal api_type "fetchNewGroupMember")}}\r\n{{variable_name}} = await fbAPI.fetchNewGroupMember(`{{group_id}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_member}} "max_member": `{{max_member}}`, {{/if}} });\r\n{{else if (equal api_type "fetchPagesByKeyword")}}\r\n{{variable_name}} = await fbAPI.fetchPagesByKeyword(`{{keyword}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_page}} "max_page": `{{max_page}}`, {{/if}} {{#if location}} "location": `{{location}}`, {{/if}} });\r\n{{else if (equal api_type "fetchGroupsByKeyword")}}\r\n{{variable_name}} = await fbAPI.fetchGroupsByKeyword(`{{keyword}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_group}} "max_group": `{{max_group}}`, {{/if}} {{#if location}} "location": `{{location}}`, {{/if}} {{#if is_near_me}} "is_near_me": {{is_near_me}}, {{/if}} {{#if is_group_public}} "is_group_public": {{is_group_public}}, {{/if}} });\r\n{{else if (equal api_type "fetchPostsInGroup")}}\r\n{{variable_name}} = await fbAPI.fetchPostsInGroup(`{{group_id}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_post}} "max_post": `{{max_post}}`, {{/if}} });\r\n{{else if (equal api_type "fetchPostInteractions")}}\r\n{{variable_name}} = await fbAPI.fetchPostInteractions(`{{post_id}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_reaction}} "max_reaction": `{{max_reaction}}`, {{/if}} });\r\n{{else if (equal api_type "fetchPostOnPage")}}\r\n{{variable_name}} = await fbAPI.fetchPostOnPage(`{{page_profile_id}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_post_on_page}} "max_post_on_page": `{{max_post_on_page}}`, {{/if}} });\r\n{{else if (equal api_type "fetchPagesOnAccount")}}\r\n{{variable_name}} = await fbAPI.fetchPagesOnAccount();\r\n{{else if (equal api_type "autoAcceptFriendRequest")}}\r\nawait fbAPI.autoAcceptFriendRequest(`{{max_accept}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} });\r\n{{else if (equal api_type "fetchFollowingOfAccount  ")}}\r\n{{variable_name}} = await fbAPI.fetchFollowingOfAccount(`{{max_account}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} });\r\n{{else if (equal api_type "addFriendByUid")}}\r\nawait fbAPI.addFriendByUid(`{{uid}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} });\r\n{{else if (equal api_type "fetchJoinedGroupsOfAccount")}}\r\n{{variable_name}} = await fbAPI.fetchJoinedGroupsOfAccount(`{{max_group}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} });\r\n{{else if (equal api_type "logoutSessionOtherDevice")}}\r\nawait fbAPI.logoutSessionOtherDevice();\r\n{{else if (equal api_type "renameAccount")}}\r\nawait fbAPI.renameAccount(`{{first_name}}`, `{{last_name}}`);\r\n{{else if (equal api_type "createPage")}}\r\nawait fbAPI.createPage(`{{name}}`, {{#if is_random_category}} [] {{else}} {{{ json category_ids }}} {{/if}}, `{{{description}}}`);\r\n{{else if (equal api_type "fetchNewPostsByKeyWord")}}\r\n{{variable_name}} = await fbAPI.fetchNewPostsByKeyWord(`{{keyword}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if max_post}} "max_post": `{{max_post}}`, {{/if}} });\r\n{{else if (equal api_type "fetchFriendsOfAccount")}}\r\n{{variable_name}} = await fbAPI.fetchFriendsOfAccount(`{{max_friend}}`, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} });\r\n{{else if (equal api_type "inviteFriendsJoinGroup")}}\r\nawait fbAPI.inviteFriendsJoinGroup(`{{group_id}}`, {{friend_ids}}, { {{#if min_time_delay}} "min_time_delay": `{{min_time_delay}}`, {{/if}} {{#if max_time_delay}} "max_time_delay": `{{max_time_delay}}`, {{/if}} {{#if num_friend_per_invite}} "num_friend_per_invite": `{{num_friend_per_invite}}` {{/if}} });\r\n{{/if}}',
    parameters: [
      {
        id: 1,
        key: 'api_type',
        type: 'select_option',
        label: 'Gói API',
        is_required: true,
        option_values: [
          {
            id: 1,
            label: 'Đổi ngôn ngữ',
            value: 'changeLanguage',
            component: [
              {
                key: 'lang',
                type: 'select_option',
                label: 'Ngôn Ngữ',
                is_required: true,
                default_value: 'en_US',
                option_values: [
                  {
                    id: 1,
                    label: 'Tiếng Anh - Mỹ',
                    value: 'en_US',
                  },
                  {
                    id: 2,
                    label: 'Tiếng Việt',
                    value: 'vi_VN',
                  },
                ],
              },
            ],
          },
          {
            id: 2,
            label: 'Đổi trang hoặc trang cá nhân',
            value: 'switchProfilePage',
            component: [
              {
                key: 'profile_id',
                type: 'string',
                label: 'ID Trang hoặc Trang Cá Nhân',
                is_required: false,
              },
            ],
          },
          {
            id: 3,
            label: 'Lấy dữ liệu người dùng hiện tại',
            value: 'getCurrentUserData',
            component: [
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 4,
            label: 'Quét video xu hướng trên Reels',
            value: 'fetchReelPosts',
            component: [
              {
                key: 'max_post',
                type: 'number',
                label: 'Số lượng bài viết quét tối đa',
                is_required: true,
                default_value: 30,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 3,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 8,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 5,
            label: 'Quét thành viên mới tham gia nhóm',
            value: 'fetchNewGroupMember',
            component: [
              {
                key: 'group_id',
                type: 'string',
                label: 'ID Nhóm',
                is_required: true,
              },
              {
                key: 'max_member',
                type: 'number',
                label: 'Số lượng thành viên quét tối đa',
                is_required: true,
                default_value: 50,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 3,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 8,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 6,
            label: 'Quét trang theo từ khóa',
            value: 'fetchPagesByKeyword',
            component: [
              {
                key: 'keyword',
                type: 'string',
                label: 'Từ khóa',
                is_required: true,
              },
              {
                key: 'location',
                type: 'string',
                label: 'Vị trí',
                is_required: false,
              },
              {
                key: 'max_page',
                type: 'number',
                label: 'Số lượng trang quét tối đa',
                is_required: true,
                default_value: 50,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 3,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 5,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 7,
            label: 'Quét nhóm theo từ khóa',
            value: 'fetchGroupsByKeyword',
            component: [
              {
                key: 'keyword',
                type: 'string',
                label: 'Từ khóa',
                is_required: true,
              },
              {
                key: 'location',
                type: 'string',
                label: 'Vị trí',
                is_required: false,
              },
              {
                type: 'group',
                component: [
                  {
                    key: 'is_near_me',
                    type: 'boolean',
                    label: 'Gần tôi',
                    default_value: false,
                  },
                  {
                    key: 'is_group_public',
                    type: 'boolean',
                    label: 'Nhóm công khai',
                    default_value: false,
                  },
                ],
              },
              {
                key: 'max_group',
                type: 'number',
                label: 'Số lượng nhóm quét tối đa',
                is_required: true,
                default_value: 50,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 3,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 10,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 8,
            label: 'Quét bài viết trong nhóm',
            value: 'fetchPostsInGroup',
            component: [
              {
                key: 'group_id',
                type: 'string',
                label: 'ID Nhóm',
                is_required: true,
              },
              {
                key: 'max_post',
                type: 'number',
                label: 'Số lượng bài viết quét tối đa',
                is_required: true,
                default_value: 20,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 9,
            label: 'Quét người tương tác bài viết',
            value: 'fetchPostInteractions',
            component: [
              {
                key: 'post_id',
                type: 'string',
                label: 'ID Bài viết',
                is_required: true,
              },
              {
                key: 'max_reaction',
                type: 'number',
                label: 'Số lượng quét tối đa',
                is_required: true,
                default_value: 50,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 10,
            label: 'Quét bài viết trên tường cá nhân hoặc trang',
            value: 'fetchPostOnPage',
            component: [
              {
                key: 'page_profile_id',
                type: 'string',
                label: 'ID Trang',
                is_required: true,
              },
              {
                key: 'max_post_on_page',
                type: 'number',
                label: 'Số lượng bài viết quét tối đa',
                is_required: true,
                default_value: 20,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 11,
            label: 'Quét danh sách trang của tài khoản',
            value: 'fetchPagesOnAccount',
            component: [
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 12,
            label: 'Tự động chấp nhận lời mời kết bạn',
            value: 'autoAcceptFriendRequest',
            component: [
              {
                key: 'max_accept',
                type: 'number',
                label: 'Số lượng chấp nhận tối đa',
                is_required: true,
                default_value: 10,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần chấp nhận',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
            ],
          },
          {
            id: 13,
            label: 'Quét danh sách tài khoản đang theo dõi của tài khoản',
            value: 'fetchFollowingOfAccount',
            component: [
              {
                key: 'max_account',
                type: 'number',
                label: 'Số lượng quét tối đa',
                is_required: true,
                default_value: 1000,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 14,
            label: 'Kết bạn theo UID',
            value: 'addFriendByUid',
            component: [
              {
                key: 'uid',
                type: 'number',
                label: 'UID',
                is_required: true,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần kết bạn',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 15,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 30,
                  },
                ],
              },
            ],
          },
          {
            id: 15,
            label: 'Quét danh sách nhóm mà tài khoản đã tham gia',
            value: 'fetchJoinedGroupsOfAccount',
            component: [
              {
                key: 'max_group',
                type: 'number',
                label: 'Số lượng nhóm quét tối đa',
                is_required: true,
                default_value: 100,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 16,
            label: 'Đăng xuất tài khoản trên các thiết bị khác, trừ thiết bị hiện tại ra',
            value: 'logoutSessionOtherDevice',
          },
          {
            id: 17,
            label: 'Đổi tên tài khoản',
            value: 'renameAccount',
            component: [
              {
                key: 'last_name',
                type: 'string',
                label: 'Họ',
                is_required: true,
              },
              {
                key: 'first_name',
                type: 'string',
                label: 'Tên',
                is_required: true,
              },
            ],
          },
          {
            id: 18,
            label: 'Tạo trang',
            value: 'createPage',
            component: [
              {
                key: 'name',
                type: 'string',
                label: 'Tên trang',
                is_required: true,
              },
              {
                key: 'is_random_category',
                type: 'checkbox',
                label: 'Lấy danh mục ngẫu nhiên',
                default_value: false,
              },
              {
                key: 'category_ids',
                type: 'select_multiple_option',
                label: 'Danh mục trang',
                is_required: false,
              },
              {
                key: 'description',
                type: 'textarea',
                label: 'Mô tả trang',
                is_required: false,
              },
            ],
          },
          {
            id: 19,
            label: 'Quét bài viết mới nhất theo từ khóa',
            value: 'fetchNewPostsByKeyWord',
            component: [
              {
                key: 'keyword',
                type: 'string',
                label: 'Từ khóa',
                is_required: true,
              },
              {
                key: 'max_post',
                type: 'number',
                label: 'Số lượng bài viết quét tối đa',
                is_required: true,
                default_value: 30,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 20,
            label: 'Quét bạn bè của tài khoản',
            value: 'fetchFriendsOfAccount',
            component: [
              {
                key: 'max_friend',
                type: 'number',
                label: 'Số lượng bạn bè quét tối đa',
                is_required: true,
                default_value: 200,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần quét',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 5,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 10,
                  },
                ],
              },
              {
                key: 'variable_name',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 21,
            label: 'Mời bạn bè tham gia nhóm',
            value: 'inviteFriendsJoinGroup',
            component: [
              {
                key: 'group_id',
                type: 'number',
                label: 'ID Nhóm',
                is_required: true,
              },
              {
                key: 'friend_ids',
                type: 'select_variable',
                label: 'Biến chứa danh sách UID bạn bè',
                is_required: true,
              },
              {
                key: 'num_friend_per_invite',
                type: 'number',
                label: 'Số lượng bạn bè mỗi lần mời',
                is_required: true,
                default_value: 10,
              },
              {
                type: 'section',
                label: 'Khoảng cách nhẫu nhiên giữa các lần mời',
                component: [
                  {
                    key: 'min_time_delay',
                    type: 'number',
                    label: 'Số giây tối thiểu',
                    is_required: 'true',
                    default_value: 10,
                  },
                  {
                    key: 'max_time_delay',
                    type: 'number',
                    label: 'Số giây tối đa',
                    is_required: 'true',
                    default_value: 15,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    alias: 'facebook_api',
    parent: 62,
  },
  {
    id: 79,
    name: 'Code',
    keyWord: 'js code',
    icon: 'hugeicons:code',
    description: 'Chèn mã Javascript tùy chỉnh',
    script_template: 'showLogRunTask("Chạy mã Javascript tùy chỉnh");\r\n{{{js_code}}}',
    parameters: [
      {
        key: 'js_code',
        type: 'script_editor',
        label: 'Mã Javascript',
        is_required: true,
      },
    ],
    alias: 'code',
    parent: 13,
  },
  {
    id: 80,
    name: 'AI',
    icon: '',
    description: '',
    script_template: '',
    parameters: null,
    alias: null,
    parent: null,
  },

  {
    id: 81,
    name: 'ChatGPT',
    icon: 'ri:openai-fill',
    description: 'Sử dụng ChatGPT để yêu cầu trả lời câu hỏi, viết nội dung.',
    keyWord: 'open ai, chat gpt',
    script_template:
      "{{#if (equal output_type 'text')}}{{#if (equal model 'custom')}}{{variable_output}} = await chatWithGPT(`{{{prompt}}}`, `{{api_key}}`, `{{{model_custom}}}`){{else}}{{variable_output}} = await chatWithGPT(`{{{prompt}}}`, `{{api_key}}`, '{{model}}'){{/if}}{{else if (equal output_type 'image')}}{{variable_output}} = await generateImageWithGPT(`{{{prompt}}}`, `{{api_key}}`, '{{image_size}}', '{{response_type}}'){{/if}}",
    parameters: [
      {
        key: 'api_key',
        type: 'string',
        label: 'API Key',
        is_required: true,
      },
      {
        key: 'output_type',
        type: 'radio',
        label: 'Dữ liệu trả về',
        default_value: 'text',
        option_values: [
          {
            id: 1,
            label: 'Văn bản',
            value: 'text',
            component: [
              {
                key: 'model',
                type: 'select_option',
                label: 'Model',
                is_required: true,
                default_value: 'gpt-3.5-turbo',
                option_values: [
                  {
                    id: 1,
                    label: 'GPT-3.5 Turbo',
                    value: 'gpt-3.5-turbo',
                  },
                  {
                    id: 2,
                    label: 'GPT-4',
                    value: 'gpt-4',
                  },
                  {
                    id: 3,
                    label: 'GPT-4 Turbo',
                    value: 'gpt-4-turbo',
                  },
                  {
                    id: 4,
                    label: 'GPT-4o',
                    value: 'gpt-4o',
                  },
                  {
                    id: 5,
                    label: 'GPT-4o Mini',
                    value: 'gpt-4o-mini',
                  },
                  {
                    id: 6,
                    label: 'Tùy chỉnh',
                    value: 'custom',
                    component: [
                      {
                        key: 'model_custom',
                        type: 'string',
                        label: 'Model tùy chỉnh',
                      },
                    ],
                  },
                ],
              },
              {
                key: 'prompt',
                type: 'textarea',
                label: 'Văn bản lệnh',
                is_required: true,
              },
              {
                key: 'variable_output',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
          {
            id: 2,
            label: 'Hình ảnh',
            value: 'image',
            component: [
              {
                key: 'prompt',
                type: 'textarea',
                label: 'Văn bản mô tả',
                is_required: true,
              },
              {
                key: 'image_size',
                type: 'select_option',
                is_required: true,
                default_value: '1024x1024',
                option_values: [
                  {
                    id: 1,
                    label: '1024 X 1024',
                    value: '1024x1024',
                  },
                  {
                    id: 2,
                    label: '1792 X 1024',
                    value: '1792x1024',
                  },
                  {
                    id: 3,
                    label: '1024 X 1792',
                    value: '1024x1792',
                  },
                ],
              },
              {
                key: 'response_type',
                type: 'radio',
                label: 'Kiểu trả về',
                radio_values: [
                  {
                    id: 1,
                    label: 'URL',
                    value: 'url',
                  },
                  {
                    id: 2,
                    label: 'Base64',
                    value: 'base64',
                  },
                ],
                default_value: 'url',
              },
              {
                key: 'variable_output',
                type: 'select_variable',
                label: 'Biến nhận giá trị',
                is_required: true,
              },
            ],
          },
        ],
      },
    ],
    alias: 'chatgpt',
    parent: 80,
  },
  {
    id: 82,
    name: 'Gemini',
    keyWord: 'open ai, gemini',
    icon: 'ri:gemini-fill',
    description: 'Sử dụng Gemini để yêu cầu trả lời câu hỏi, viết nội dung.',
    script_template:
      "{{#if (equal model 'custom')}}{{variable_output}} = await chatWithGemini(`{{{prompt}}}`, `{{api_key}}`, `{{{model_custom}}}`, `{{{image_attachment}}}`){{else}}{{variable_output}} = await chatWithGemini(`{{{prompt}}}`, `{{api_key}}`, '{{model}}', `{{{image_attachment}}}`){{/if}}",
    parameters: [
      {
        key: 'api_key',
        type: 'string',
        label: 'API Key',
        is_required: true,
      },
      {
        key: 'model',
        type: 'select_option',
        label: 'Model',
        is_required: true,
        default_value: 'gemini-2.0-flash',
        option_values: [
          {
            id: 1,
            label: 'Text Embedding',
            value: 'text-embedding-004',
          },
          {
            id: 2,
            label: 'Gemini 1.5 Pro',
            value: 'gemini-1.5-pro',
          },
          {
            id: 3,
            label: 'Gemini 1.5 Flash-8B',
            value: 'gemini-1.5-flash-8b',
          },
          {
            id: 4,
            label: 'Gemini 1.5 Flash',
            value: 'gemini-1.5-flash',
          },
          {
            id: 5,
            label: 'Gemini 2.0 Flash-Lite',
            value: 'gemini-2.0-flash-lite',
          },
          {
            id: 6,
            label: 'Gemini 2.0 Flash',
            value: 'gemini-2.0-flash',
          },
          {
            id: 7,
            label: 'Tùy chỉnh',
            value: 'custom',
            component: [
              {
                key: 'model_custom',
                type: 'string',
                label: 'Model tùy chỉnh',
              },
            ],
          },
        ],
      },
      {
        key: 'prompt',
        type: 'textarea',
        label: 'Văn bản lệnh',
        is_required: true,
      },
      {
        key: 'image_attachment',
        type: 'choose_file',
        label: 'Tệp hình ảnh đính kèm (tùy chọn)',
        is_required: false,
      },
      {
        key: 'variable_output',
        type: 'select_variable',
        label: 'Biến nhận giá trị',
        is_required: true,
      },
    ],
    alias: 'gemini',
    parent: 80,
  },
];

const getDeepDefaultValue = (optionValue, defaultValue) => {
  if (optionValue.option_values && optionValue.option_values.length > 0) {
    optionValue.option_values.forEach((option) => {
      if (option.component) {
        option.component.forEach((component) => {
          defaultValue[component.key] = component.default_value ?? null;

          getDeepDefaultValue(component, defaultValue);
        });
      }
    });
  }
};

export const getFlowchartValue = (alias) => {
  const nodeData = flowchartOptions.find((item) => item.alias === alias);

  if (!nodeData) return {};

  const defaultValue = {};
  if (nodeData.parameters) {
    nodeData.parameters.forEach((param) => {
      defaultValue[param.key] = param.default_value ?? null;
      getDeepDefaultValue(param, defaultValue);
    });
  }
  return defaultValue;
};
