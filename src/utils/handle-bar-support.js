/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
import Handlebars from 'handlebars';
import { generateOperation, generateRandomString } from './commom';

// eslint-disable-next-line func-names
Handlebars.registerHelper('contains', function (str, substring, options) {
  if (typeof str === 'string' && str.includes(substring)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('json', (context) =>
  JSON.stringify(context)
    .replace(/"(\\".*?\\")"/g, '`$1`')
    .replace(/"([^(")"]+)":"([^(")"]+)"/g, '[`$1`]:`$2`')
);

Handlebars.registerHelper('optionalChaining', (path) =>
  path
    .split('.')
    .map((p) => `${p}?`)
    .join('')
);

// eslint-disable-next-line func-names
Handlebars.registerHelper('escapeSpecialChars', (text) => {
  if (typeof text !== 'string') {
    text = text.toString();
  }
  const escapedText = text.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  return new Handlebars.SafeString(escapedText);
});

// eslint-disable-next-line func-names
Handlebars.registerHelper('replaceVariableSyntax', (text) => {
  if (typeof text !== 'string') {
    text = text.toString();
  }
  const replacedText = text.replace(/VARIABLE\.(\w+(?:\.\w+)?)/g, (match, group) => `\${${group}}`);
  return new Handlebars.SafeString(replacedText);
});

// eslint-disable-next-line func-names
Handlebars.registerHelper('isDefined', function (value, options) {
  if (typeof value !== 'undefined') {
    return options.fn(this);
  }
  return options.inverse(this);
});

// eslint-disable-next-line func-names
Handlebars.registerHelper('isNotEmptyObject', function (obj, options) {
  if (typeof obj === 'object' && Object.keys(obj).length > 0 && obj.constructor === Object) {
    return options.fn(this);
  }
  return options.inverse(this);
});

export const generateLogicScript = (source, params) => {
  if (source === '') return '';
  Handlebars.registerHelper('equal', (arg1, arg2, options) => arg1 === arg2);
  const template = Handlebars.compile(source);
  const result = template(params);
  return result;
};

export const convertedArray = (originalArray) => {
  const convertedObject = {};
  originalArray.forEach((item) => {
    convertedObject[item.key] = item.value;
  });

  return convertedObject;
};

const generateAndCondition = (conditions) => {
  const condition = conditions.map((item) => {
    const { leftType, leftValue, operator, rightType, rightValue } = item;
    return generateOperation({
      leftType: leftType.value,
      leftValue,
      operator: operator.value,
      rightType: rightType.value,
      rightValue,
    });
  });

  return condition.join(' && ');
};

export const generateCondition = (conditions) => {
  const condition = conditions.map((item) => generateAndCondition(item?.conditions));
  return condition.join(' || ');
};

export const generateFields = (type) => {
  switch (type) {
    case 'doi':
      return { time_type: 'random', num_seconds: '1', num_start: '1', num_end: '3' };
    case 'nhan_chuot':
      return {
        mode: 'normal',
        button: 'left',
        select_by: 'selector',
        selector_type: 'xpath',
        selector: '',
        timeout: 10,
        x_coordinates: 0,
        y_coordinates: 0,
        press_time: 0,
        is_click_on_element: false,
      };
    case 'lay_van_ban':
      return {
        selector_type: 'xpath',
        element_selector: '',
        variable_name: '',
      };
    case 'http_request':
      return {
        url: '',
        method: '',
        content_type: 'json',
        json_string_data: '',
        response_type: 'json',
        path_data: '',
        variable_name: '',
        params: [],
        data: [],
        headers: [],
      };
    case 'mo_url':
      return { url: '', timeout: 0, wait_until: 'domcontentloaded' };
    case 'mo_tab_moi':
      return { url: '', timeout: 0, wait_until: 'domcontentloaded' };
    case 'chuyen_tab':
      return {
        find_by: 'match_pattern',
        pattern: '',
        title: '',
        order_number: '',
        is_active: true,
      };
    case 'dong_tab':
      return { close_type: 'current', pattern: '', title: '', order_number: '' };
    case 'lay_url':
      return { variable_name: '' };
    case 'cuon_chuot':
      return {
        scroll_type: 'coordinates',
        direction: 'down',
        x_coordinates: 0,
        y_coordinates: 0,
        element_selector: '',
        timeout: 30,
        speed: 5,
      };
    case 'nhan_phim':
      return { keys: null };
    case 'nhap_van_ban':
      return {
        selector_type: '',
        text: '',
        speed: 0.1,
        selector: '',
      };
    case 'bang_tinh':
      return {
        spreadsheet_type: 'google_sheet',
        file_path: '',
        sheet_name: '',
        action_type: 'read',
        range: '',
        is_choose_first_rows_as_key: true,
        variable_name: '',
        data: '',
        search_field: '',
        search_value: '',
        clear: '',
        credentials_json: '',
        email_share: '',
        sheet_id: '',
        data_update: [],
      };
    case 'lap_co_dieu_kien':
      return {
        loop_id: generateRandomString(),
        conditions: null,
      };
    case 'lap_du_lieu':
      return {
        loop_id: generateRandomString(),
        loop_through: 'numbers',
        from: 1,
        to: 10,
        refererce_key: '',
        max_loop: 0,
        index_start: 1,
        variable_name: '',
        element_selector: '',
        selector_switch: false,
        selector_timeout: 30,
      };
    case 'lap_phan_tu':
      return {
        loop_id: generateRandomString(),
        type: 'css_selector',
        element_selector: '',
        selector_switch: false,
        selector_timeout: 30,
        max_loop: 0,
        reverse_order: false,
        action: 'none',
      };
    case 'diem_cuoi_vong_lap':
      return {
        loop_id: '',
      };
    case 'dieu_kien':
      return {
        conditions: [
          {
            id: 'condition-1727341244697',
            name: 'Nhánh 1',
            conditions: [],
          },
        ],
        retry: false,
        try_for: 10,
        timeout: 1000,
      };
    case 'bo_nho_tam':
      return {
        action_type: 'get',
        assign_variable: false,
        variable_name: '',
        // insert_table: true,
        // select_column: '',
        text: '',
        is_from_selection: false,
      };
    case 'luu_media':
      return {
        media_type: '',
        url_string: '',
        selector_type: 'xpath',
        selector: '',
        timeout: 30,
        file_name: '',
        output_path: '',
      };
    case 'element_exists':
      return {
        type: 'css_selector',
        element_selector: '',
        try_for: 1,
        timeout: 5000,
        throw_error: false,
      };
    case 'notification':
      return {
        title: '',
        message: '',
        icon: '',
        image: '',
      };
    case 'export_data':
      return {
        type: 'table',
        file_name: '',
        on_conflict: 'uniquify',
        export_as: 'json',
        reference_key: '',
        variable_name: '',
      };
    case 'chup_man_hinh':
      return {
        file_name: '',
        folder_output: '',
      };
    case 'lay_tai_nguyen':
      return {
        platform_type: '',
        variable_name: '',
      };
    case 'cap_nhat_tai_nguyen':
      return {
        platform_type: '',
        data: [],
        is_create_when_not_exists: false,
      };
    case 'chay_ma_javascript':
      return {
        script:
          '/*\n  Sử dụng mẫu này để có thể trả về\n  dữ liệu được lưu vào biến\n*/\n(() => {\n  const name = "MKTLogin";\n  const message = "Hello" + name;\n\n  return message;\n  /* Giá trị của mesage sẽ được\n    lưu vào "Biến nhận dữ liệu"*/\n})()\n',
        variable_name: '',
      };
    case 'cookies':
      return {
        action_type: 'import',
        cookie_str: '',
        variable_name: '',
      };
    case 'lay_noi_dung_html':
      return {
        variable_name: '',
      };
    case 'lay_ma_otp_2fa':
      return {
        two_fa: '',
        variable_name: '',
      };
    case 'cho_tai_trang':
      return {
        wait_until: 'load',
        timeout: 30,
      };
    case 'ghi_tep':
      return {
        file_path: '',
        input_data: '',
        write_mode: '',
        append_type: 'new_line',
        delimiter: '',
      };
    case 'xoa_tep':
      return {
        file_path: '',
      };
    case 'doc_tep_txt':
      return {
        file_path: '',
        mode: 'all_line',
        line_position: 'random',
        is_delete_after_read: true,
      };
    case 'chuyen_frame':
      return {
        frame_type: 'sub',
        choose_type: 'url',
        url_char: '',
        order_val: 1,
        selector_type: 'css',
        selector_val: '',
      };
    case 'ngau_nhien':
      return {
        random_type: 'number',
        min: 0,
        max: 10,
        length: 10,
        has_upper_case: true,
        has_lower_case: true,
        has_number: true,
        has_special: false,
        variable_name: '',
      };
    case 'doc_thu_muc':
      return {
        folder_path: '',
        include_subdirectories: false,
        variable_name: '',
      };
    case 'xu_ly_bien':
      return {
        variable: '',
        data_type: '',
        method: '',
        order_number: '',
        start: 1,
        end: '',
        search_value: '',
        new_value: '',
        replace_all: false,
        separator: '',
        variable_output: '',
        conditions: [],
        strings: [],
        path: '',
        is_return_default: false,
        default_data_type: '',
        default_value: '',
        custom_value: '',
      };
    case 'du_lieu_phan_tu':
      return {
        selector_type: 'xpath',
        selector: '',
        data_types: [],
        data_path: '',
        variable_name: '',
        timeout: 30,
      };
    case 'tai_tep_len':
      return {
        selector_type: 'xpath',
        selector: '',
        is_upload_folder: false,
        path: '',
        num_file: '',
        is_upload_by_dialog: false,
        timeout: 30,
      };
    case 'gan_bien':
      return {
        variable_name: '',
        operator: '=',
        value_two: '',
      };
    case 'lay_thoi_gian':
      return {
        format_return: '',
        variable_name: '',
      };
    case 'di_chuyen_chuot':
      return {
        target: 'element',
        selector_type: 'xpath',
        selector: '',
        timeout: 10,
        x_coordinates: 0,
        y_coordinates: 0,
      };
    case 'log':
      return {
        message: '',
        args: {},
      };
    case 'facebook_api':
      return {
        api_type: '',
        lang: 'en_US',
        profile_id: '',
        variable_name: '',
        max_post: 30,
        max_post_on_page: 20,
        min_time_delay: 3,
        max_time_delay: 8,
        group_id: '',
        max_member: 50,
        keyword: '',
        location: '',
        max_page: 50,
        is_near_me: false,
        is_group_public: false,
        max_group: 50,
        post_id: '',
        max_reaction: 50,
        max_accept: 10,
        max_account: 1000,
        uid: '',
        last_name: '',
        first_name: '',
        name: '',
        is_random_category: false,
        category_ids: [],
        description: '',
        max_friend: 200,
        friend_ids: '',
        num_friend_per_invite: 10,
      };
    case 'code':
      return {
        js_code: '',
      };
    case 'chatgpt':
      return {
        api_key: '',
        output_type: 'text',
        model: 'gpt-3.5-turbo',
        model_custom: '',
        prompt: '',
        variable_output: '',
        image_size: '1024x1024',
        response_type: 'url',
      };
    case 'gemini':
      return {
        api_key: '',
        model: 'gemini-2.0-flash',
        model_custom: '',
        prompt: '',
        image_attachment: '',
        variable_output: '',
      };
    default:
      return {};
  }
};

export const NodeFlowchartValidation = (nodes) => {
  let isError = false;

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]?.data?.parameters) {
      for (let k = 0; k < nodes[i].data.parameters.length; k++) {
        const _key = nodes[i].data.parameters[k]?.key;
        let goalField = null;
        for (const property in nodes[i].dataFields) {
          if (String(property) === String(_key)) {
            goalField = nodes[i].dataFields[property];
          }
        }

        if (
          nodes[i].data.parameters[k].is_required &&
          (goalField === null || goalField === '' || goalField === undefined)
        ) {
          isError = true;
        }
      }
    }
  }

  return isError;
};

export const getConnectedNodes = (startNodeId, listNodes, listEdges) => {
  // Khởi tạo một tập để lưu các node đã duyệt
  const visited = new Set();

  // Hàm đệ quy để duyệt qua các node liên kết
  const dfs = (nodeId) => {
    // Nếu node đã được duyệt, bỏ qua
    if (visited.has(nodeId)) return;

    // Đánh dấu node này đã được duyệt
    visited.add(nodeId);

    // Tìm tất cả các edge có liên quan đến node này
    const connectedEdges = listEdges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );

    // Lấy tất cả các node liên kết
    connectedEdges.forEach((edge) => {
      const nextNodeId = edge.source === nodeId ? edge.target : edge.source;
      dfs(nextNodeId); // Tiếp tục duyệt đệ quy
    });
  };

  // Bắt đầu duyệt từ startNodeId
  dfs(startNodeId);

  // Trả về chuỗi các node liên kết (bao gồm cả startNodeId)
  return Array.from(visited).map((id) => listNodes.find((node) => node.id === id));
};

export function extractBracedValues(str) {
  if (str.includes('{{')) {
    // Xử lý cho trường hợp sử dụng biểu thức vòng lặp
    const regex = /{{([^}]+)}}/g;
    const matches = [];
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }

    return matches;
    // eslint-disable-next-line no-else-return
  } else if (str.includes('{')) {
    const regex = /{([^}]+)}/g;
    const matches = [];
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  return [];
}

export const sortEdgesForLayoutAttempt = (
  listEdges,
  successHandleId = 'success',
  errorHandleId = 'error'
) => {
  const edgesToSort = [...listEdges];

  const getHandlePriority = (handle) => {
    if (handle === successHandleId) {
      return 1;
    }
    if (handle === errorHandleId) {
      return 2;
    }
    return 3;
  };

  edgesToSort.sort((edgeA, edgeB) => {
    if (edgeA.source < edgeB.source) {
      return -1;
    }
    if (edgeA.source > edgeB.source) {
      return 1;
    }

    const priorityA = getHandlePriority(edgeA.sourceHandle);
    const priorityB = getHandlePriority(edgeB.sourceHandle);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return 0;
  });

  return edgesToSort;
};
