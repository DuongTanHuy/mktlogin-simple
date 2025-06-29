import PropTypes from 'prop-types';
import { Link } from 'react-scroll';

import {
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from '@mui/lab';
import { useResponsive } from 'src/hooks/use-responsive';

const ServiceView = () => {
  const settings = useSettingsContext();

  return (
    <Container
      maxWidth={settings.themeStretch ? 'md' : 'xs'}
      sx={{
        px: '0px!important',
      }}
    >
      <Stack sx={{ width: 1, pb: 10 }}>
        <Timeline
          sx={{
            position: 'fixed',
            right: 0,
            m: 0,
            pr: 1,
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {[
            { id: 'title_01', label: 'Quy định chung' },
            { id: 'title_02', label: 'Từ chối bảo đảm' },
            { id: 'title_03', label: 'Điều khoản sử dụng' },
            { id: 'title_04', label: 'Hành vi bị cấm' },
            { id: 'title_05', label: 'Quy định sử dụng dịch vụ' },
            { id: 'title_06', label: 'Điều khoản và chính sách' },
            { id: 'title_07', label: 'Giới hạn trách nhiệm' },
            { id: 'title_08', label: 'Bảo mật thông tin người dùng' },
            { id: 'title_09', label: 'Bản quyền và quyền sở hữu trí tuệ' },
            { id: 'title_10', label: 'Điều khoản khác' },
          ].map((title, index) => (
            <OrderItem key={title.id} title={title} lastTimeline={index === 9} />
          ))}
        </Timeline>
        <Typography variant="h4" align="center" gutterBottom>
          ĐIỀU KHOẢN SỬ DỤNG MKTLogin
        </Typography>
        <Title id="title_01">1. Quy định chung</Title>
        <Paragraph>
          Điều khoản Sử dụng quy định các điều khoản ràng buộc bạn khi sử dụng Dịch vụ của{' '}
          <AppName />
          . Thuật ngữ &#8243;Bạn&#8243; và/hoặc &#8243;Người sử dụng&#8243; sau đây được gọi chung
          để chỉ tới những người sử dụng Dịch vụ của <AppName />. Vui lòng nghiên cứu kỹ và lưu lại
          một bản Điều khoản Sử dụng này.
        </Paragraph>
        <Paragraph>
          Bằng việc sử dụng Dịch vụ của chúng tôi, Bạn đồng ý bị ràng buộc với Điều khoản Sử dụng
          này. Nếu Bạn không đồng ý bị ràng buộc với Điều khoản Sử dụng này, Bạn nên chấm dứt ngay
          lập tức việc sử dụng Dịch vụ của <AppName /> .
        </Paragraph>
        <Paragraph gutterBottom>
          Chúng tôi thực hiện Điều khoản Sử dụng này theo quy định của pháp luật hiện hành và không
          nội dung nào trong Điều khoản Sử dụng này cản trở quyền của <AppName /> tuân thủ các quy
          định hoặc yêu cầu của chính phủ, tòa án, cơ quan thi hành án liên quan đến việc Bạn sử
          dụng Dịch vụ của <AppName /> hoặc thông tin do chúng tôi nhận được hoặc thu được từ việc
          sử dụng Dịch vụ của Bạn.
        </Paragraph>

        <Title id="title_02">2. Từ chối bảo đảm</Title>
        <Paragraph>
          Websites và Dịch vụ của <AppName /> được cung cấp dựa trên nguyên tắc không bảo hành, trên
          cơ sở dịch vụ và tính năng sẵn có mà không có bất kỳ sự bảo đảm bằng bất kỳ hình thức nào
          dù được thể hiện hoặc ngụ ý như vậy. <AppName /> không đảm bảo rằng sự vận hành các phần
          mềm hoặc Dịch vụ của <AppName /> sẽ không bị gián đoạn hoặc bị lỗi.
        </Paragraph>
        <Paragraph>
          <AppName /> không chịu trách nhiệm đối với bất kỳ sự mất mát dữ liệu, tổn thất lợi ích nào
          hoặc các vấn đề khác liên quan đến việc sử dụng Dịch vụ của <AppName /> , bao gồm nhưng
          không giới hạn đến tất cả các thông tin, dữ liệu, văn bản, phần mềm, âm nhạc, âm thanh,
          hình ảnh, đồ họa, video, thông điệp hoặc các nguyên liệu khác (“Nội dung”) mà Bạn có thể
          lưu giữ, đưa lên, hoặc truyền tải thông qua Dịch vụ. Bạn đồng ý Dịch vụ của <AppName />{' '}
          với tất cả sự rủi ro.
        </Paragraph>

        <Title id="title_03">3. Thay đổi điều khoản sử dụng</Title>
        <Paragraph>
          <AppName /> giữ quyền thay đổi và/hoặc sửa đổi mà không cần báo trước bất kỳ điều khoản
          nào trong Điều khoản Sử dụng này tùy từng thời điểm. Những sự thay đổi và/hoặc sửa đổi như
          vậy sẽ có hiệu lực ngay khi được cập nhật lên website này. Nếu Bạn tiếp tục sử dụng Dịch
          vụ của <AppName /> sau khi các thay đổi và/hoặc sửa đổi được đăng lên, Bạn đã chấp nhận và
          đồng ý với các thay đổi và/hoặc sửa đổi đó
        </Paragraph>

        <Title id="title_04">4. Hành vi bị cấm khi sử dụng dịch vụ</Title>
        <Paragraph>
          Bạn phải sử dụng Dịch vụ của <AppName /> phù hợp với quy định hiện hành của pháp luật Việt
          Nam. <AppName /> không bỏ qua hoặc cho phép bất kỳ hành vi bất hợp pháp hoặc bị cấm liên
          quan đến Dịch vụ của <AppName /> . Dưới đây là một số hành vi bất hợp pháp hoặc bị cấm khi
          Bạn sử dụng Dịch vụ của <AppName /> . Chúng tôi giữ quyền điều tra và thực hiện những biện
          pháp pháp lý cần thiết đối với bất kỳ người nào, theo quyền quyết định của <AppName />, vi
          phạm quy định này, bao gồm nhưng không giới hạn đến thông báo tới các Cơ quan Quản lý Nhà
          nước.
        </Paragraph>

        <Attention>
          Bạn không được phép thực hiện các hành vi bị cấm bao gồm, nhưng không giới hạn tới việc
          lợi dụng Internet vì mục đích:
        </Attention>
        <List>
          <Gist>
            Chống lại nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam; gây phương hại đến an ninh quốc
            gia, trật tự, an toàn xã hội; phá hoại khối đại đoàn kết toàn dân; tuyên truyền chiến
            tranh xâm lược; gây hận thù, mâu thuẫn, kỳ thị giữa các dân tộc, sắc tộc, tôn giáo;Chống
            lại nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam; gây phương hại đến an ninh quốc gia,
            trật tự, an toàn xã hội; phá hoại khối đại đoàn kết toàn dân; tuyên truyền chiến tranh
            xâm lược; gây hận thù, mâu thuẫn, kỳ thị giữa các dân tộc, sắc tộc, tôn giáo;
          </Gist>
          <Gist>
            Tuyên truyền, kích động bạo lực, dâm ô, đồi trụy, tội ác, tệ nạn xã hội, mê tín dị đoan;
            phá hoại thuần phong, mỹ tục của dân tộc;
          </Gist>
          <Gist>
            Tiết lộ bí mật nhà nước, bí mật quân sự, an ninh, kinh tế, đối ngoại và những bí mật
            khác đã được pháp luật quy định;
          </Gist>
          <Gist>
            Đưa các thông tin xuyên tạc, vu khống, xúc phạm uy tín của tổ chức; danh dự, nhân phẩm
            của công dân;
          </Gist>
          <Gist>
            Lợi dụng Internet để quảng cáo, tuyên truyền, mua bán hàng hoá, dịch vụ thuộc danh mục
            cấm theo quy định của pháp luật;
          </Gist>
          <Gist>Xâm phạm quyền sở hữu trí tuệ;</Gist>
          <Gist>Sản xuất, lưu hành sản phẩm công nghệ thông tin trái pháp luật;</Gist>
          <Gist>
            Tạo đường dẫn trái phép đối với tên miền của tổ chức, cá nhân sử dụng hợp pháp tên miền
            đó;
          </Gist>
          <Gist>
            Gây rối, phá hoại hệ thống thiết bị và cản trở trái pháp luật việc quản lý, cung cấp, sử
            dụng các dịch vụ Internet và thông tin điện tử trên Internet;
          </Gist>
          <Gist>
            Đánh cắp và sử dụng trái phép mật khẩu, khoá mật mã và thông tin riêng của các tổ chức,
            cá nhân trên Internet;
          </Gist>
          <Gist>
            Tạo ra và cài đặt các chương trình virus máy tính, phần mềm gây hại để thực hiện một
            trong những hành vi trái pháp luật về công nghệ thông tin.
          </Gist>
        </List>

        <Title id="title_05">5. Quy định sử dụng dịch vụ</Title>
        <Typography>
          Khi sử dụng Dịch vụ của <AppName /> , Bạn bị ràng buộc chấp thuận và tuân thủ các điều
          kiện quy định dưới đây:
        </Typography>
        <ol type="I">
          <Paragraph component="li">
            <AppName /> cấp cho bạn sử dụng miễn phí, không tính phí bản quyền, không thể chuyển
            nhượng và không độc quyền để sử dụng phần mềm trình duyệt web <AppName /> và Dịch vụ.
            Bạn không được và không cho phép bất kỳ ai khác sao chép, tạo sản phẩm phái sinh, hoặc
            cố gắng trích xuất mã nguồn của phần mềm trình duyệt web <AppName /> .
          </Paragraph>
          <Paragraph component="li">
            Phần mềm trình duyệt web <AppName /> mà bạn sử dụng có thể được tự động tải xuống và cài
            đặt thường xuyên các bản cập nhật để sửa chữa, cải tiến, nâng cao và phát triển tốt hơn
            các Dịch vụ của <AppName /> . Trong quá trình cập nhật, trình duyệt <AppName /> có thể
            phân phối các bản cập nhật theo cơ chế peer to peer. Bạn chấp thuận nhận và cho phép{' '}
            <AppName />
            sử dụng cơ chế cập nhật trình duyệt web như vậy trong quá trình sử dụng Dịch vụ.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý và công nhận rằng các Nội dung thuộc trách nhiệm cá nhân của người chủ sở hữu
            Nội dung đó. <AppName /> được quyền nhưng không có nghĩa vụ kiểm duyệt, sàng lọc, từ
            chối, sửa đổi hoặc thay đổi bất kỳ Nội dung nào có sẵn trên các Dịch vụ của <AppName />{' '}
            . Bạn phải tự chịu rủi ro khi sử dụng Dịch vụ của <AppName /> mặc dù khi cung cấp Dịch
            vụ,
            <AppName /> vẫn sử dụng các công cụ để sàng lọc thông tin có nội dung không phù hợp, vi
            phạm quy định của pháp luật Việt Nam.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý rằng Bạn phải chịu trách nhiệm cho các hành vi của mình và cho bất kỳ Nội
            dung nào mà Bạn có được, tạo ra, trưng bày hoặc truyền tải khi sử dụng Dịch vụ của chúng
            tôi cũng như các hậu quả nếu có xuất phát từ hành vi sử dụng và Nội dung của bạn. Bạn
            đồng ý rằng bạn chỉ sử dụng Dịch vụ của chúng tôi cho các mục đích hợp pháp, hợp lệ, và
            phù hợp với các quy định của Điều khoản Sử dụng và Chính sách Bảo mật của <AppName />{' '}
            cũng như các hướng dẫn hay chính sách khác mà chúng tôi áp dụng.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý rằng <AppName /> sẽ không chịu trách nhiệm đối với việc bất kỳ Nội dung nào
            của Bạn bị xóa hoặc không lưu trữ được trong quá trình chúng tôi duy trì và cung cấp các
            Dịch vụ.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý rằng Bạn sẽ không kinh doanh, khai thác, sản xuất lại, sao chép, sử dụng các
            Dịch vụ của <AppName /> vì mục đích thương mại trừ khi có sự đồng ý bằng văn bản của
            <AppName />.
          </Paragraph>
          <Paragraph component="li">
            Bạn công nhận rằng <AppName /> cung cấp một số Dịch vụ có nội dung quảng cáo và trưng
            bày các quảng cáo và khuyến mãi. Bạn đồng ý rằng <AppName /> có thể đặt thông tin quảng
            cáo và khuyến mãi như vậy tại các Dịch vụ và <AppName /> sẽ không chịu bất kỳ trách
            nhiệm nào đối với tổn thất và mất mát mà Bạn phải gánh chịu do sự xuất hiện của các dịch
            vụ quảng cáo và khuyến mãi hoặc Bạn thường xuyên phải nhận được các thông tin quảng cáo
            và khuyến mãi như vậy khi sử dụng Dịch vụ của <AppName />.
          </Paragraph>
          <Paragraph component="li">
            Bạn công nhận rằng <AppName /> có thể liên kết với hoặc cung cấp đường link của các
            websites khác và Bạn đồng ý rằng <AppName /> không kiểm soát và chịu trách nhiệm đối với
            bất kỳ Nội dung, quảng cáo, dịch vụ, sản phẩm mà Bạn có được hay biết được từ các
            websites đó. Đồng thời Bạn cũng xác nhận rằng <AppName /> sẽ không chịu trách nhiệm đối
            với tổn thất và mất mát mà Bạn phải gánh chịu có nguyên nhân từ hoặc do việc Bạn sử dụng
            Nội dung, quảng cáo, dịch vụ, sản phẩm từ các website như vậy.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý rằng Bạn sẽ không tham gia bất kỳ hoạt động hay thực hiện bất kỳ hành vi nào
            có thể hoặc đe dọa làm gián đoạn hoặc tạm ngừng Dịch vụ của <AppName /> hoặc các dịch vụ
            và mạng lưới liên kết với các Dịch vụ của <AppName />.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý rằng <AppName /> , với toàn quyền quyết định của mình, có thể dừng cung cấp
            các Dịch vụ cho bạn nếu <AppName /> tin rằng Bạn đã vi phạm hoặc thực hiện không đúng
            các điều kiện sử dụng Dịch vụ của <AppName />.
          </Paragraph>
          <Paragraph component="li">
            Bạn đồng ý và công nhận rằng <AppName /> có toàn quyền quyết định và vào bất kỳ thời
            điểm nào chấm dứt việc cung cấp toàn bộ hoặc một phần Dịch vụ, có thể hoặc không cần
            thông báo. Bạn đồng ý rằng bất kỳ việc chấm dứt việc Bạn sử dụng Dịch vụ nào của{' '}
            <AppName /> theo bất kỳ quy định nào của Điều khoản Sử dụng này sẽ có hiệu lực mà không
            cần thông báo trước. Đồng thời, Bạn đồng ý rằng <AppName /> không chịu trách nhiệm với
            Bạn hoặc với bất kỳ bên thứ ba nào do việc Bạn bị chấm dứt sử dụng Dịch vụ.
          </Paragraph>
        </ol>

        <Title id="title_06">
          6. Các điều khoản dịch vụ và chính sách bổ sung áp dụng cho một số sản phẩm, dịch vụ nhất
          định
        </Title>
        <Paragraph>
          Trước hết, Điều khoản Sử dụng này áp dụng cho tất cả các Dịch vụ của <AppName /> . Bên
          cạnh đó, chúng tôi cũng liệt kê dưới đây các Điều khoản dịch vụ và các chính sách bổ sung
          được áp dụng cho một số dịch vụ nhất định của <AppName />, cụ thể như sau:
        </Paragraph>
        <Title>
          6.1. Trình duyệt web <AppName sx={{ fontWeight: 700 }} />:
        </Title>
        <ul>
          <Paragraph component="li">Điều khoản dịch vụ.</Paragraph>
          <ul>
            <Paragraph component="li">Quy định chung</Paragraph>
            <Paragraph>
              Điều khoản Sử dụng quy định các điều khoản ràng buộc bạn khi sử dụng Dịch vụ của
              <AppName />. Thuật ngữ &#8243;Bạn&#8243; và/hoặc &#8243;Người sử dụng&#8243; sau đây
              được gọi chung để chỉ tới những người sử dụng Dịch vụ của <AppName />. Vui lòng nghiên
              cứu kỹ và lưu lại một bản Điều khoản Sử dụng này. Bằng việc tải phần mềm và sử dụng
              Dịch vụ của chúng tôi, Bạn đồng ý bị ràng buộc với Điều khoản Sử dụng này. Nếu Bạn
              không đồng ý bị ràng buộc với Điều khoản Sử dụng này, Bạn nên chấm dứt ngay lập tức
              việc sử dụng Dịch vụ của <AppName />.
            </Paragraph>
            <Paragraph>
              Bạn xác nhận và đồng ý rằng giữa Bạn và <AppName /> không có bất kỳ một quan hệ liên
              doanh, đối tác, quan hệ lao động, hoặc quan hệ đại lý nào xuất phát từ Điều khoản Sử
              dụng này hoặc do việc Bạn sử dụng Dịch vụ của <AppName />. Chúng tôi thực hiện Điều
              khoản Sử dụng này theo quy định của pháp luật hiện hành và không nội dung nào trong
              Điều khoản Sử dụng này cản trở quyền của <AppName /> tuân thủ các quy định hoặc yêu
              cầu của chính phủ, tòa án, cơ quan thi hành án liên quan đến việc Bạn sử dụng Dịch vụ
              của
              <AppName /> hoặc thông tin do chúng tôi nhận được hoặc thu được từ việc sử dụng Dịch
              vụ của Bạn.
            </Paragraph>

            <Paragraph component="li">Từ chối bảo đảm</Paragraph>
            <Paragraph>
              Website và Dịch vụ của <AppName /> được cung cấp dựa trên nguyên tắc không bảo hành,
              trên cơ sở dịch vụ và tính năng sẵn có mà không có bất kỳ sự bảo đảm bằng bất kỳ hình
              thức nào dù được thể hiện hoặc ngụ ý như vậy. <AppName /> không đảm bảo rằng Dịch vụ
              của chúng tôi sẽ đáp ứng các yêu cầu của Bạn hoặc đảm bảo rằng sự vận hành các phần
              mềm hoặc Dịch vụ của <AppName /> sẽ không bị gián đoạn hoặc bị lỗi.
            </Paragraph>
            <Paragraph>
              <AppName /> không chịu trách nhiệm đối với bất kỳ sự mất mát dữ liệu, tổn thất lợi ích
              nào hoặc các vấn đề khác liên quan đến việc sử dụng Dịch vụ của <AppName />, bao gồm
              nhưng không giới hạn đến tất cả các thông tin, dữ liệu, văn bản, phần mềm, âm nhạc, âm
              thanh, hình ảnh, đồ họa, video, thông điệp hoặc các nguyên liệu khác (&#8243;Nội
              dung&#8243;) mà Bạn có thể lưu giữ, đưa lên, hoặc truyền tải thông qua Dịch vụ. Bạn
              đồng ý Dịch vụ của
              <AppName /> với tất cả sự rủi ro.
            </Paragraph>

            <Paragraph component="li">Thay đổi điều khoản sử dụng</Paragraph>
            <Paragraph>
              <AppName /> giữ quyền thay đổi và/hoặc sửa đổi mà không cần báo trước bất kỳ điều
              khoản nào trong Điều khoản Sử dụng này tùy từng thời điểm. Những sự thay đổi và/hoặc
              sửa đổi như vậy sẽ có hiệu lực ngay khi đăng lên website:…... Nếu Bạn tiếp tục sử dụng
              Dịch vụ của <AppName /> sau khi các thay đổi và/hoặc sửa đổi được đăng lên, Bạn đã
              chấp nhận và đồng ý với các thay đổi và/hoặc sửa đổi đó.
            </Paragraph>

            <Paragraph component="li">Hành vi cấm sử dụng dịch vụ</Paragraph>
            <Paragraph>
              Bạn phải sử dụng Dịch vụ của <AppName /> phù hợp với quy định hiện hành của pháp luật
              Việt Nam. <AppName /> không bỏ qua hoặc cho phép bất kỳ hành vi bất hợp pháp hoặc bị
              cấm liên quan đến Dịch vụ của <AppName />. Dưới đây là một số hành vi bất hợp pháp
              hoặc bị cấm khi Bạn sử dụng Dịch vụ của <AppName />. Chúng tôi giữ quyền điều tra và
              thực hiện những biện pháp pháp lý cần thiết đối với bất kỳ người nào, theo quyền quyết
              định của
              <AppName />, vi phạm quy định này, bao gồm nhưng không giới hạn việc thông báo tới các
              Cơ quan Quản lý Nhà nước.
            </Paragraph>

            <Attention>
              Bạn không được phép thực hiện các hành vi bị cấm bao gồm, nhưng không giới hạn tới
              việc lợi dụng Internet vì mục đích:
            </Attention>
            <List>
              <Gist>
                Chống lại nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam; gây phương hại đến an ninh
                quốc gia, trật tự, an toàn xã hội; phá hoại khối đại đoàn kết toàn dân; tuyên truyền
                chiến tranh xâm lược; gây hận thù, mâu thuẫn, kỳ thị giữa các dân tộc, sắc tộc, tôn
                giáo;
              </Gist>
              <Gist>
                Tuyên truyền, kích động bạo lực, dâm ô, đồi trụy, tội ác, tệ nạn xã hội, mê tín dị
                đoan; phá hoại thuần phong, mỹ tục của dân tộc;
              </Gist>
              <Gist>
                Tiết lộ bí mật nhà nước, bí mật quân sự, an ninh, kinh tế, đối ngoại và những bí mật
                khác đã được pháp luật quy định;
              </Gist>
              <Gist>
                Đưa các thông tin xuyên tạc, vu khống, xúc phạm uy tín của tổ chức; danh dự, nhân
                phẩm của công dân;
              </Gist>
              <Gist>
                Lợi dụng Internet để quảng cáo, tuyên truyền, mua bán hàng hoá, dịch vụ thuộc danh
                mục cấm theo quy định của pháp luật;Xâm phạm quyền sở hữu trí tuệ;
              </Gist>
              <Gist>Sản xuất, lưu hành sản phẩm công nghệ thông tin trái pháp luật;</Gist>
              <Gist>
                Tạo đường dẫn trái phép đối với tên miền của tổ chức, cá nhân sử dụng hợp pháp tên
                miền đó;
              </Gist>
              <Gist>
                Gây rối, phá hoại hệ thống thiết bị và cản trở trái pháp luật việc quản lý, cung
                cấp, sử dụng các dịch vụ Internet và thông tin điện tử trên Internet;
              </Gist>
              <Gist>
                Tạo ra và cài đặt các chương trình virus máy tính, phần mềm gây hại để thực hiện một
                trong những hành vi trái pháp luật về công nghệ thông tin.
              </Gist>
            </List>

            <Attention>
              Các hành vi sau đây bị coi là lạm dụng <AppName sx={{ fontWeight: 600 }} /> và bị
              nghiêm cấm:
            </Attention>
            <List>
              <Gist>
                Thông báo về trình duyệt <AppName /> dưới tên gọi Chrome hoặc bất kỳ tên gọi nào
                khác không liên quan đến tên thật của <AppName />;
              </Gist>
              <Gist>
                Thanh toán cho bất kỳ bên thứ ba nào khác trong một chương trình hợp tác các khoản
                doanh thu quảng cáo có được từ các lần nhấp chuột (clicks) của người sử dụng trình
                duyệt <AppName />, nhưng không cho phép <AppName /> tham gia vào chương trình hợp
                tác đó;
              </Gist>
              <Gist>
                Khóa trình duyệt <AppName /> hoặc thông báo sai sự thật rằng trình duyệt <AppName />{' '}
                không được hỗ trợ;
              </Gist>
              <Gist>
                Ngăn chặn việc tải trình duyệt <AppName />.
              </Gist>
            </List>

            <Paragraph component="li">Quy định sử dụng dịch vụ</Paragraph>
            <Paragraph>
              Khi sử dụng Dịch vụ của <AppName />, Bạn bị ràng buộc chấp thuận và tuân thủ các điều
              kiện quy định dưới đây:
            </Paragraph>
            <ol type="I">
              <Paragraph component="li">
                <AppName /> cấp cho bạn sử dụng miễn phí, không tính phí bản quyền, không thể chuyển
                nhượng và không độc quyền để sử dụng phần mềm trình duyệt web <AppName /> và Dịch
                vụ. Bạn không được và không cho phép bất kỳ ai khác sao chép, tạo sản phẩm phái
                sinh, hoặc cố gắng trích xuất mã nguồn của phần mềm trình duyệt web <AppName />.
              </Paragraph>
              <Paragraph component="li">
                Phần mềm trình duyệt web <AppName /> mà bạn sử dụng có thể được tự động tải xuống và
                cài đặt thường xuyên các bản cập nhật để sửa chữa, cải tiến, nâng cao và phát triển
                tốt hơn các Dịch vụ của <AppName /> . Trong quá trình cập nhật, trình duyệt{' '}
                <AppName /> có thể phân phối các bản cập nhật theo cơ chế peer to peer. Bạn chấp
                thuận nhận và cho phép <AppName /> sử dụng cơ chế cập nhật trình duyệt web như vậy
                trong quá trình sử dụng Dịch vụ.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý và công nhận rằng các Nội dung thuộc trách nhiệm cá nhân của người chủ sở
                hữu Nội dung đó. <AppName /> được quyền nhưng không có nghĩa vụ kiểm duyệt, sàng
                lọc, từ chối, sửa đổi hoặc thay đổi bất kỳ Nội dung nào có sẵn trên các Dịch vụ của
                <AppName /> . Bạn phải tự chịu rủi ro khi sử dụng Dịch vụ của <AppName /> mặc dù khi
                cung cấp Dịch vụ, <AppName /> vẫn sử dụng các công cụ để sàng lọc thông tin có nội
                dung không phù hợp, vi phạm quy định của pháp luật Việt Nam.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý rằng Bạn phải chịu trách nhiệm cho các hành vi của mình và cho bất kỳ Nội
                dung nào mà Bạn có được, tạo ra, trưng bày hoặc truyền tải khi sử dụng Dịch vụ của
                chúng tôi cũng như các hậu quả nếu có xuất phát từ hành vi sử dụng và Nội dung của
                bạn. Bạn đồng ý rằng bạn chỉ sử dụng Dịch vụ của chúng tôi cho các mục đích hợp
                pháp, hợp lệ, và phù hợp với các quy định của Điều khoản Sử dụng và Chính sách Bảo
                mật của <AppName /> cũng như các hướng dẫn hay chính sách khác mà chúng tôi áp dụng.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý rằng Bạn sẽ không kinh doanh, khai thác, sản xuất lại, sao chép, sử dụng
                các Dịch vụ của <AppName /> vì mục đích thương mại trừ khi có sự đồng ý bằng văn bản
                của <AppName />.
              </Paragraph>
              <Paragraph component="li">
                Bạn công nhận rằng MKTLogin cung cấp một số Dịch vụ có nội dung quảng cáo và trưng
                bày các quảng cáo và khuyến mãi. Bạn đồng ý rằng MKTLogin có thể đặt thông tin quảng
                cáo và khuyến mãi như vậy tại các Dịch vụ và MKTLogin sẽ không chịu bất kỳ trách
                nhiệm nào đối với tổn thất và mất mát mà Bạn phải gánh chịu do sự xuất hiện của các
                dịch vụ quảng cáo và khuyến mãi hoặc Bạn thường xuyên phải nhận được các thông tin
                quảng cáo và khuyến mãi như vậy khi sử dụng Dịch vụ của MKTLogin.
              </Paragraph>
              <Paragraph component="li">
                Bạn công nhận rằng MKTLogin có thể liên kết với hoặc cung cấp đường link của các
                websites khác và Bạn đồng ý rằng MKTLogin không kiểm soát và chịu trách nhiệm đối
                với bất kỳ Nội dung, quảng cáo, dịch vụ, sản phẩm mà Bạn có được hay biết được từ
                các websites đó. Đồng thời Bạn cũng xác nhận rằng MKTLogin sẽ không chịu trách nhiệm
                đối với tổn thất và mất mát mà Bạn phải gánh chịu có nguyên nhân từ hoặc do việc Bạn
                sử dụng Nội dung, quảng cáo, dịch vụ, sản phẩm từ các website như vậy.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý rằng Bạn sẽ không tham gia bất kỳ hoạt động hay thực hiện bất kỳ hành vi
                nào có thể hoặc đe dọa làm gián đoạn hoặc tạm ngừng Dịch vụ của MKTLogin hoặc các
                dịch vụ và mạng lưới liên kết với các Dịch vụ của MKTLogin.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý rằng MKTLogin, với toàn quyền quyết định của mình, có thể dừng cung cấp
                các Dịch vụ cho bạn nếu MKTLogin tin rằng Bạn đã vi phạm hoặc thực hiện không đúng
                các điều kiện sử dụng Dịch vụ của MKTLogin.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý và công nhận rằng MKTLogin có toàn quyền quyết định và vào bất kỳ thời
                điểm nào chấm dứt việc cung cấp toàn bộ hoặc một phần Dịch vụ, có thể hoặc không cần
                thông báo. Đồng thời, Bạn đồng ý rằng MKTLogin không chịu trách nhiệm với Bạn hoặc
                với bất kỳ bên thứ ba nào do việc Bạn bị chấm dứt sử dụng Dịch vụ.
              </Paragraph>
              <Paragraph component="li">
                Bạn đồng ý rằng, MKTLogin có quyền quét dữ liệu từ bất kỳ dịch vụ công cộng nào mà
                bạn truy cập thông qua trình duyệt và sử dụng các nội dung mang tính công khai của
                nó vào mục đích nâng cao chất lượng duyệt web của bạn, cũng như chất lượng của các
                dịch vụ mà bạn đang sử dụng với MKTLogin.
              </Paragraph>
            </ol>

            <Paragraph component="li">Giới hạn trách nhiệm</Paragraph>
            <List>
              <Gist>
                Bạn xác nhận và đồng ý rằng MKTLogin chỉ sẵn sàng cung cấp các Dịch vụ nếu Bạn đồng
                ý giới hạn trách nhiệm của chúng tôi đối với Bạn và các bên thứ ba. Bạn đồng ý rằng
                Bạn chịu trách nhiệm bồi thường duy nhất và toàn bộ đối với bất kỳ khiếu nại, tố cáo
                nào tới MKTLogin liên quan đến bất kỳ sự vi phạm quy định sử dụng nào do việc Bạn
                ngừng sử dụng Dịch vụ của MKTLogin.
              </Gist>
              <Gist>
                Bạn đồng ý bảo vệ, bồi thường và giữ cho MKTLogin và các công ty liên kết của
                MKTLogin không bị tổn hại bởi bất kỳ khiếu nại, khiếu kiện, chi phí, tổn thất, thiệt
                hại, phán quyết của tòa án và phí tổn nào, bao gồm nhưng không giới hạn phí luật sư,
                liên quan đến hoặc phát sinh từ việc vi phạm Điều khoản Sử dụng hoặc bất kỳ sự sử
                dụng của Bạn đối với các Dịch vụ, hoặc bất kỳ người nào khác sử dụng Dịch vụ thông
                qua Bạn hoặc sử dụng máy tính của Bạn. MKTLogin giữ quyền, bằng chi phí của mình,
                đảm nhận hoàn toàn việc bảo vệ và kiểm soát (nhưng không có trách nhiệm) đối với bất
                kỳ vấn đề nào phát sinh như vậy tùy thuộc vào sự bồi thường của Bạn.
              </Gist>
            </List>

            <Paragraph component="li">Bảo mật thông tin người dùng</Paragraph>
            <Paragraph>
              Để hiểu rõ cơ chế bảo mật thông tin người dùng, xin vui lòng tham khảo Chính sách bảo
              mật của MKTLogin tại website của chúng tôi. Chính sách này sẽ cung cấp cho các bạn cơ
              chế thu tập, xử lý và bảo vệ thông tin người dùng. Khi bạn cài đặt và sử dụng trình
              duyệt này, bạn đã đồng ý tuân theo Chính sách bảo mật của MKTLogin.
            </Paragraph>

            <Paragraph component="li">Bảo vệ bản quyền và quyền sỡ hữu trí tuệ khác</Paragraph>
            <List>
              <Gist>
                Dịch vụ của MKTLogin và tất cả các phần mềm cần thiết, yếu tố cấu thành của Dịch vụ,
                bao gồm cả các quyền sở hữu trí tuệ đối với Dịch vụ của MKTLogin, và tất cả các phần
                mềm cần thiết, yếu tố cấu thành của Dịch vụ (&#8243;Sở hữu Trí tuệ&#8243;), được bảo
                vệ bởi bản quyền, quyền về thương hiệu, nhãn dịch vụ, hoặc quyền tài sản khác do
                MKTLogin sở hữu hoặc được sở hữu bởi bên thứ ba nào mà đã cấp quyền sở hữu trí tuệ
                cho MKTLogin. Bạn không được quyền sử dụng bất kỳ tên thương mại, nhãn hiệu của hàng
                hóa và dịch vụ, biểu tượng, tên miền và các hình thức nhận diện hàng hóa, dịch vụ
                đặc trưng nào khác của MKTLogin vào mục đích thương mại trừ khi Bạn được sự chấp
                thuận bằng văn bản của MKTLogin, hoặc việc sử dụng của Bạn không gây ảnh hưởng, cản
                trở, tác động xấu tới việc hoạt động bình thường của MKTLogin.
              </Gist>
              <Gist>
                Sự biên tập (có nghĩa là thu thập, sắp xếp, và tập hợp) của tất cả Sở hữu Trí tuệ
                của Dịch vụ là tài sản độc quyền của MKTLogin và được bảo vệ bởi pháp luật Việt Nam
                và các công ước quốc tế về bản quyền. Sở hữu trí tuệ của Dịch vụ và các dịch vụ khác
                mà MKTLogin sở hữu, vận hành, kiểm soát, hoặc được cấp phép không được sao chụp, sản
                xuất lại, tái bản, tải lên, đăng lên, truyền tải, hoặc phân phối dưới bất kỳ hình
                thức nào. Việc sử dụng hoặc sửa đổi quyền sở hữu trí tuệ của MKTLogin dưới bất kỳ
                hình thức nào, bao gồm nhưng không giới hạn tới bất kỳ website hoặc môi trường được
                kết nối máy vi tính nào, mà không được sự chấp thuận trước bằng văn bản là vi phạm
                bản quyền và các quyền tài sản khác của MKTLogin và bị nghiêm cấm.
              </Gist>
              <Gist>
                Theo Điều khoản này, MKTLogin tôn trọng và không tước đoạt quyền sở hữu hoặc các
                quyền khác của bạn đối với các Nội dung bạn gửi, đăng, chuyển giao hoặc hiển thị
                trên trình duyệt của chúng tôi. Bạn đồng ý chịu trách nhiệm bảo vệ và thi hành các
                quyền đó, và MKTLogin không có nghĩa vụ thực hiện công việc đó nhân danh bạn trừ khi
                giữa bạn và MKTLogin có thỏa thuận riêng bằng văn bản về vấn đề này.
              </Gist>
              <Gist>
                Chúng tôi tôn trọng quyền sở hữu trí tuệ của người khác và yêu cầu Người sử dụng của
                MKTLogin cũng như vậy. Bạn không được tải lên, gắn vào, đăng lên, truyền đi hoặc
                bằng cách khác tạo sẵn bất kỳ yếu tố cấu thành nào gây ảnh hưởng đến bản quyền,
                thương hiệu, bí mật thương mại hoặc quyền tài sản khác của bất kỳ tổ chức hoặc cá
                nhân nào. Chúng tôi có quyền chấm dứt đường truy cập vào Dịch vụ của MKTLogin hoặc
                bất kỳ dịch vụ nào do MKTLogin cung cấp đối với người bị nghi ngờ xâm phạm.
              </Gist>
            </List>

            <Paragraph component="li">Điều khoản khác</Paragraph>
            <Attention>Luật điều chỉnh</Attention>
            <Paragraph>
              Điều khoản Sử dụng này được điều chỉnh bởi và giải thích phù hợp với pháp luật Việt
              Nam. Nếu bất kỳ điều khoản nào trong Điều khoản Sử dụng này không hợp pháp, vô hiệu
              hoặc vì bất kỳ lý do nào không thể thực hiện được, thì điều khoản đó sẽ được xem là
              tách rời khỏi Điều khoản Sử dụng này và không ảnh hưởng đến hiệu lực và tính thực thi
              của các điều khoản còn lại của Điều khoản Sử dụng này.
            </Paragraph>
            <Attention>Chấm dứt</Attention>
            <List>
              <Gist>
                Điều khoản Sử dụng này có hiệu lực cho đến khi bị chấm dứt bởi Bạn hoặc bởi MKTLogin
                theo các trường hợp sau đây:
              </Gist>
              <Gist>
                Chấm dứt bởi Bạn: Bạn có thể chấm dứt Điều khoản Sử dụng này bằng cách không sử dụng
                Dịch vụ của MKTLogin nữa.
              </Gist>
              <Gist>
                Chấm dứt bởi MKTLogin: Điều khoản Sử dụng này chấm dứt ngay lập tức mà MKTLogin
                không cần phải thông báo trước nếu (i) theo sự quyết định của MKTLogin, Bạn không
                tuân thủ bất kỳ điều khoản nào của Điều khoản Sử dụng này hoặc (ii) Pháp luật hoặc
                quyết định của chính phủ, tòa án, cơ quan thi hành án yêu cầu MKTLogin chấm dứt Điều
                khoản Sử dụng.
              </Gist>
              <Gist>
                Khi chấm dứt Điều khoản Sử dụng này, Bạn phải hủy bỏ tất cả thông tin, tư liệu nhận
                được từ MKTLogin và các website của MKTLogin, cũng như tất cả bản sao của thông tin,
                tư liệu đó, dù được lập bởi theo các quy định của Điều khoản Sử dụng này hoặc của
                các quy định khác.
              </Gist>
            </List>
            <Attention>Liên hệ</Attention>
            <Paragraph>
              Nếu Bạn có bất kỳ câu hỏi nào về Điều khoản Sử dụng này, về hoạt động của website:…..,
              hoặc sự kết nối của Bạn với MKTLogin, vui lòng liên hệ với chúng tôi qua email…….. Tất
              cả các vấn đề hoặc mâu thuẫn sẽ được giải quyết nhanh chóng và hợp lý.
            </Paragraph>
          </ul>

          <Paragraph component="li">Chính sách bảo mật.</Paragraph>
          <Paragraph>
            Chính sách này xác định các biện pháp đảm bảo tính bảo mật thông tin khi sử dụng trình
            duyệt MKTLogin.
          </Paragraph>
          <Paragraph>
            Trong chính sách bảo mật này, những khái niệm như: &#8243;MKTLogin&#8243;, &#8243;trình
            duyệt MKTLogin&#8243;, &#8243;chúng tôi&#8243;, &#8243;của chúng tôi&#8243; được hiểu là
            Công ty TNHH MKTLogin – công ty hoạt động trong lĩnh vực công nghệ thông tin tại Việt
            Nam, và những khái niệm như: &#8243;Bạn&#8243;, &#8243;các bạn&#8243;, &#8243;người
            dùng&#8243;, &#8243;người sử dụng&#8243; được hiểu là bạn, người cài đặt và sử dụng
            trình duyệt MKTLogin.
          </Paragraph>
          <Paragraph>
            Trong quá trình làm việc với trình duyệt MKTLogin, người sử dụng cung cấp cho chúng tôi
            một số thông tin ẩn danh (tức là những thông tin không định dạng cá nhân nào cụ thể).
            Những thông tin này sẽ được chúng tôi sử dụng nhằm mục đích nâng cao chất lượng các sản
            phẩm của MKTLogin, như là phát triển các tính năng của trình duyệt, nâng cao chất lượng
            tìm kiếm, vv.
          </Paragraph>
          <Paragraph>
            Chúng tôi luôn đề cao sự bảo mật thông tin của người dùng, vì vậy sẽ cố gắng giúp cho
            người dùng hiểu rõ việc chúng tôi thu thập, sử dụng những thông tin này như thế nào. Vì
            mục đích đó, chính sách bảo mật này sẽ cho phép người dùng biết: những thông tin được
            chúng tôi thu thập, cách chúng tôi xử lý những thông tin đó, và cách để vô hiệu hóa việc
            gửi những thông tin kể trên qua trình duyệt.
          </Paragraph>
          <ul>
            <Paragraph component="li">
              Những thông tin được gửi cho <AppName sx={{ fontWeight: 600 }} /> khi người dùng sử
              dụng trình duyệt
            </Paragraph>
            <Paragraph>
              Trước hết xin lưu ý rằng, khi làm việc với trình duyệt MKTLogin, người dùng không phải
              cung cấp bất kỳ thông tin cá nhân nào.
            </Paragraph>
            <Paragraph>
              Khi làm việc với bất kỳ trình duyệt nào, trong đó có MKTLogin, trên máy chủ của các
              websites được truy cập sẽ nhận được theo chế độ mặc định một số thông tin đăng nhập
              chung như là địa chỉ IP máy tính của người dùng, một hay một số tệp tin cookie. Người
              dùng có thể cài đặt trình duyệt theo chế độ không nhận các tệp cookie từ bất kỳ
              website nào mà người dùng truy cập.
            </Paragraph>
            <Paragraph>
              Ngoài ra, một số tính năng của trình duyệt MKTLogin có thể gửi một số lượng hạn chế
              các thông tin bổ sung tới máy chủ MKTLogin hoặc tới hệ thống tìm kiếm mặc định trong
              các trường hợp sau:
            </Paragraph>
            <List>
              <Gist>
                Khi trong trình duyệt MKTLogin có mở chế độ nhiều người dùng, bạn có thể tạo ra các
                bản sao riêng cho từng người dùng trên cùng một máy tính. Tương tự như khi sử dụng
                chế độ này ở trình duyệt Google Chrome (Xem chính sách bảo mật của Chrome tại:
                https://www.google.com/chrome/browser/privacy/), bất kỳ ai trong số các người dùng
                trình duyệt trên cùng một máy tính cũng có thể tiếp cận các thông tin trong các hồ
                sơ của trình duyệt. Vì vậy, nếu bạn không muốn ai đó khi sử dụng trình duyệt chung
                máy tính có thể tiếp cận thông tin của bạn, bạn có thể thiết lập tài khoản sử dụng
                riêng trên hệ điều hành của máy tính.
              </Gist>
              <Gist>
                Nếu người dùng sử dụng công cụ tìm kiếm Google, trình duyệt MKTLogin sẽ liên kết với
                máy chủ của Google khi khởi động hoặc khi bạn thay đổi mạng internet, nhằm lựa chọn
                địa chỉ web phù hợp nhất để gửi các truy vấn tìm kiếm của bạn. Tương tự như ở các
                trình duyệt khác, như: Chrome, Mozilla Firefox hay Apple Safari, mỗi khi bạn nhập
                địa chỉ URL hay các truy vấn tìm kiếm vào thanh địa chỉ của trình duyệt (omnibox),
                các ký tự bạn gõ sẽ được chuyển vào hệ thống tìm kiếm mặc định. Nhờ vậy, bạn nhận
                được các gợi ý kết tìm kiếm. Khi bạn sử dụng một gợi ý tìm kiếm hoặc địa chỉ URL gợi
                ý, trình duyệt MKTLogin cũng có thể gửi những thông tin này tới hệ thống tìm kiếm
                mặc định. Ngoài ra, nếu bạn vào trình duyệt MKTLogin thông qua tài khoản Google,
                nguyên văn bạn nhập vào Hộp tìm kiếm App Launcher có thể được gửi tới Google để đưa
                ra các gợi ý về địa chỉ hay ứng dụng mà bạn cần. Nếu như bạn không muốn việc gửi các
                thông tin này được thực hiện, bạn có thể tắt tính năng gợi ý omnibox trong thanh cài
                đặt. Để bổ sung cho hệ thống tìm kiếm mặc định, các truy vấn tìm kiếm từ thanh địa
                chỉ cũng sẽ được gửi tới hệ thống tìm kiếm MKTLogin, tương tự như các hệ thống
                meta-search (như infospace.com; webcrawler.com) gửi truy vấn tới một số hệ thống tìm
                kiếm. Chức năng này cho phép chúng tôi lựa chọn và đưa ra những kết quả tìm kiếm phù
                hợp nhất cho người dùng, nâng cao hiệu quả chất lượng dịch vụ. Để vô hiệu hóa việc
                gửi truy vấn này, bạn cần tắt tính năng meta-search của MKTLogin trong cài đặt.
              </Gist>
              <Gist>
                Nếu bạn mở chức năng tìm kiếm instant của trình duyệt MKTLogin và được hỗ trợ bởi hệ
                thống tìm kiếm mặc định, kết quả tìm kiếm cũng như các gợi ý sẽ xuất hiện ngay lập
                tức. Hoạt động của chức năng này tương tự với ở trình duyệt Google Chrome (Thông tin
                về quy tắc lưu lại các gợi ý trên thanh địa chỉ và tính năng tìm kiếm instant search
                của Google, các bạn có thể tham khảo tại:
                https://support.google.com/chrome/?p=cpn_logging_policy.);
              </Gist>
              <Gist>
                Khi bạn nhập một địa chỉ URL không có thực, MKTLogin (giống như ở Chrome) sẽ gửi địa
                chỉ này tới Google để giúp bạn tìm được địa chỉ URL mà bạn thật sự cần. Google cũng
                có thể sử dụng thông tin này một cách tổng hợp để trợ giúp những người dùng khác (ví
                dụ: thông báo cho họ biết là trang web không làm việc). Bạn cũng có thể tắt tính
                năng thông báo về các địa chỉ URL như vậy trong thanh cài đặt của trình duyệt.
              </Gist>
              <Gist>
                Trình duyệt MKTLogin thường xuyên kết nối với máy chủ MKTLogin nhằm kiểm tra việc
                cập nhật phiên bản, xác định trạng thái kết nối, hài hòa các tùy chỉnh cũng như xác
                định số lượng người dùng. Mỗi phiên bản của trình duyệt MKTLogin khi cài đặt sẽ có
                một mật mã ngẫu nhiên. Mật mã này sẽ được chuyển về máy chủ của chúng tôi. Trong quá
                trình sử dụng trình duyệt, mật mã này có thể được thay đổi, khi đó mật mã mới cũng
                sẽ được thiết lập một cách ngẫu nhiên.
              </Gist>
              <Gist>
                Khi bạn truy cập MKTLogin bằng tài khoản của Google, tính năng đồng bộ hóa sẽ được
                mở một cách tự động. Trên máy chủ của Google sẽ lưu trữ những thông tin nhất định có
                liên quan đến tài khoản Google của bạn, như: lịch sử, bookmarks và các cài đặt khác.
                Những thông tin được lưu giữ trong tài khoản của bạn sẽ được bảo vệ bởi chính sách
                bảo mật của Google. Google lưu giữ những thông tin này nhằm giúp bạn có thể đăng
                nhập dễ dàng vào tài khoản của mình từ bất kỳ thiết bị nào có cài đặt trình duyệt
                với tính năng đồng bộ hóa. Bạn có thể tắt tính năng đồng bộ hóa này tại cài đặt của
                trình duyệt MKTLogin.
              </Gist>
              <Gist>
                Khi bạn tạo hồ sơ giám sát trên trình duyệt MKTLogin thông qua tài khoản Google,
                những thông tin của hồ sơ giám sát sẽ được đồng bộ hóa và lưu giữ tại máy chủ của
                Google. Bạn có thể tiếp cận thông qua trang web: chrome.com/manage.
              </Gist>
              <Gist>
                Nếu bạn chọn chức năng “dịch thuật”, MKTLogin sẽ gửi tới Google văn bản mà bạn nhập
                vào để dịch. Việc bảo mật những thông tin từ văn bản của bạn sẽ được bảo vệ bởi
                Chính sách bảo mật của Google.
              </Gist>
              <Gist>
                Nếu bạn sử dụng chức năng kiểm tra lỗi chính tả và thêm dấu, đoạn văn bản bạn nhập
                vào sẽ được gửi tới máy chủ của MKTLogin, đồng thời bạn sẽ được gợi ý các phương án
                viết từ cho phù hợp. Bạn có thể tắt cả hai chức năng này trong cài đặt của trình
                duyệt.
              </Gist>
              <Gist>
                Nếu bạn sử dụng tính năng đồng bộ hóa của MKTLogin bằng cách đăng nhập vào trình
                duyệt thông qua tài khoản cá nhân, khi đó một số thông tin nhất định liên quan đến
                tài khoản như: bookmarks, lịch sử duyệt web, và các cài đặt khác sẽ được gửi về và
                lưu trữ tại máy chủ của MKTLogin. Bạn có thể lựa chọn cho phép những thông tin nào
                được phép đồng bộ. Bạn cũng có thể không dùng tính năng này bằng cách sử dụng trình
                duyệt MKTLogin mà không cần đăng nhập.
              </Gist>
              <Gist>
                Chức năng nhập giọng nói của trình duyệt MKTLogin sẽ gửi tới Google bản ghi âm truy
                vấn, ngôn ngữ trình duyệt mặc định của bạn cũng như cài đặt ngữ pháp của trang web
                mà bạn đang sử dụng tính năng nhập bằng giọng nói. Điều này là cần thiết để chuyển
                bản ghi âm giọng nói thành văn bản. Nếu bạn bật thống kê sử dụng và báo cáo sự cố
                đồng thời với chức năng nhập giọng nói, khi đó những thông tin bổ sung cũng sẽ được
                gửi về MKTLogin, như: địa chỉ URL của website sử dụng chức năng nhập giọng nói,
                phiên bản của hệ điều hành, tên của nhà sản xuất, loại máy tính của bạn, cũng như
                thông tin phần cứng hỗ trợ âm thanh.
              </Gist>
              <Gist>
                Nếu bạn sử dụng tính năng tự động điền (tức là tự động hoàn thành tên địa chỉ trang
                web dựa trên các biểu mẫu tương tự mà bạn đã điền trước đó) và cho phép trình duyệt
                MKTLogin lưu những thông tin này trong tài khoản Google của bạn, khi đó Google có
                thể nhận được các thông tin về biểu mẫu web được dùng cho việc đồng bộ hóa. Việc bảo
                mật những thông tin này được xem xét trong Opera với chức năng Turbo và hàng loạt
                các trình duyệt dành cho di động nhằm tiết kiệm lưu lượng truy cập.
              </Gist>
              <Gist>
                Trình duyệt MKTLogin mặc định bật chức năng gửi thống kê và lịch sử sử dụng trình
                duyệt, những thông tin chung về hệ thống người dùng và báo cáo sự cố. Chức năng này
                áp dụng cho toàn bộ người dùng phiên bản này của trình duyệt MKTLogin. Những thông
                tin thu thập được cho phép chúng tôi hiểu được cách mà người dùng tương tác với
                trình duyệt, cũng như giúp dự đoán các vấn đề phát sinh khi người dùng sử dụng trình
                duyệt, nâng cao chất lượng sử dụng và phát triển các sản phẩm của MKTLogin. MKTLogin
                cũng có thể gửi các thông tin ẩn danh từ lịch sử sử dụng trình duyệt. Điều đó góp
                phần nâng cao chất lượng tìm kiếm MKTLogin và phát triển nền tảng quảng cáo. Người
                dùng có thể tắt lựa chọn gửi thông tin này trong cài đặt của trình duyệt.
              </Gist>
              <Gist>
                Chúng tôi luôn cố gắng không để những thông tin liên quan đến cá nhân người dùng
                được gửi qua trình duyệt MKTLogin. Bên cạnh đó, nếu bạn sử dụng tính năng đồng bộ
                hóa của MKTLogin bằng cách đăng nhập vào trình duyệt, chúng tôi có thể lưu trữ thông
                tin liên quan đến việc đăng nhập của bạn. Ngoài ra, các báo cáo sự cố (giống như các
                báo cáo ở trình duyệt Chrome) có thể chứa những thông tin về tình trạng hệ thống ở
                thời điểm xảy ra sự cố, cũng như thông tin về nguyên nhân xảy ra sự cố, và trong
                trường hợp đó, Chúng tôi có thể gửi cho bên thứ ba những thông tin chung (không phải
                thông tin cá nhân) mà chúng tôi nhận được khi phân tích sự cố, như: thông tin về tần
                suất xảy ra một số loại sự cố nhất định
              </Gist>
            </List>

            <Paragraph component="li">
              Thông tin Google nhận được khi sử dụng chức năng duyệt website an toàn thông qua trình
              duyệt <AppName sx={{ fontWeight: 600 }} /> và các trình duyệt khác.
            </Paragraph>
            <Paragraph>
              Trình duyệt MKTLogin và một số trình duyệt khác (Google Chrome, Mozilla Firefox, Apple
              Safari) đều hỗ trợ chức năng duyệt website an toàn của Google. Trong chế độ này, trình
              duyệt nhận được từ các máy chủ Google thông tin về các website khả nghi, để xác định
              xem nó có độc hại hay lừa đảo hay không.
            </Paragraph>
            <Paragraph>
              Trình duyệt sẽ định kỳ kết nối với các máy chủ của Google để cập nhật danh sách các
              website được nhận dạng là lừa đảo hay chứa phần mềm độc hại. Trong trường hợp này,
              Google không nhận được bất cứ thông tin tài khoản hay thông tin cá nhân nào. Google
              chỉ có thể nhận được những thông tin nhật ký chung, như địa chỉ IP, một hay một số
              cookie. Bản sao cập nhật danh sách duyệt web an toàn sẽ được lưu giữ cục bộ trong hệ
              thống của bạn.
            </Paragraph>
            <Paragraph>
              Danh sách duyệt web an toàn được kiểm tra, đối chiếu khi bạn truy cập bất kỳ website
              nào. Nếu phát hiện sự trùng khớp với danh sách này, trình duyệt sẽ gửi cho Google bản
              sao được băm nhỏ của URL trang web đó để nhận được thông tin bổ sung. Google không thể
              xác định được URL thật của website mà bạn đang truy cập. Cụ thể về hoạt động của chức
              năng này xem tại: http://code.google.com/apis/safebrowsing/firefox3_privacy_faq.html.
            </Paragraph>
            <Paragraph>
              Ngoài ra, trình duyệt MKTLogin có những chức năng duyệt web an toàn sau:
            </Paragraph>
            <List>
              <Gist>
                Trong một số phiên bản có công nghệ duyệt web an toàn cho phép xác định những
                website có nguy cơ độc hại và những tệp tin tải xuống được bạn sử dụng mà không có
                trong danh sách của Google. Thông tin về URL hoàn chỉnh hoặc nguồn tải xuống có thể
                được gửi để Google kiểm tra. Trong trường hợp này Google sẽ không nhận được bất kỳ
                thông tin tài khoản hay thông tin cá nhân nào của bạn, ngoại trừ những thông tin
                nhật ký chung (địa chỉ IP, URL, một hay một số tệp tin cookie).
              </Gist>
              <Gist>
                Duyệt web an toàn được thiết kế để mỗi khi phát hiện những website độc hại, những
                thông tin bổ sung cho việc cải tiến chức năng này sẽ được gửi về cho Google. Những
                thông tin này được chuyển đi khi bạn đóng trang web được cảnh báo hoặc khi chuyển từ
                trang web đó sang một trang web khác. Trong các báo cáo sẽ chứa URL và nội dung
                website được cảnh báo, và cả URL của trang mà đưa bạn đến trang web được cảnh báo.
                Thông tin này cho phép Google kiểm tra xem liệu trang web này có nguy hiểm cho người
                dùng hay không.
              </Gist>
              <Gist>
                Nếu trên trình duyệt MKTLogin mở chức năng gửi thống kê sử dụng, thì khi bạn chuyển
                sang trang web có nguy cơ độc hại, một số thông tin sẽ được gửi về cho MKTLogin, bao
                gồm: URL hoàn chỉnh của trang web được truy cập, tiêu đề giới thiệu được gửi tới
                trang web đó, và địa chỉ URL trùng khớp với ghi chép trong danh sách các trang độc
                hại của duyệt web an toàn.
              </Gist>
              <Gist>
                Bạn có thể tắt chức năng duyệt web an toàn trong trình duyệt MKTLogin vào bất kỳ
                thời điểm nào tại cài đặt của trình duyệt
              </Gist>
            </List>

            <Paragraph component="li">
              Thông tin được gửi cho nhà điều hành các website mà bạn truy cập thông qua trình duyệt
              <AppName sx={{ fontWeight: 600 }} />, cũng như cho một số đối tác của{' '}
              <AppName sx={{ fontWeight: 600 }} />.
            </Paragraph>
            <Paragraph>
              Những website mà bạn truy cập thông qua trình duyệt MKTLogin, cũng như các trình duyệt
              khác (Google Chrome, Mozilla Firefox, Apple Safari), sẽ tự động nhận được các thông
              tin nhật ký chung, bao gồm:
            </Paragraph>
            <List>
              <Gist>Địa chỉ truy vấn trang web</Gist>
              <Gist>Địa chỉ IP</Gist>
              <Gist>Loại trình duyệt</Gist>
              <Gist>Ngôn ngữ trình duyệt</Gist>
              <Gist>Ngày và thời gian truy vấn</Gist>
              <Gist>Tệp tin cookie được sử dụng để xác nhận</Gist>
            </List>
            <Paragraph>
              Những trang web này có thể tạo những tệp tin cookie riêng và lưu giữ những thông tin
              của mình trên máy tính của bạn. Bạn có thể thiết lập hạn chế đối với những tệp cookie
              và những thông tin khác trên trang cài đặt của trình duyệt MKTLogin.
            </Paragraph>
            <Paragraph>
              Khi sử dụng tính năng tìm kiếm MKTLogin, thì ngoài những thông tin nhật ký chung, hệ
              thống tìm kiếm sẽ nhận được các thông tin thường được sử dụng bởi các hệ thống tìm
              kiếm (tương tự như Google hay Bing):
            </Paragraph>
            <List>
              <Gist>
                Truy vấn tìm kiếm và các ký tự truy vấn được nhập, nhờ đó bạn có thể nhận được các
                gợi ý tìm kiếm, qua đó rút ngắn thời gian nhập truy vấn;
              </Gist>
              <Gist>
                Thông tin định vị, nhờ đó hệ thống tìm kiếm có thể mang lại những kết quả tìm kiếm
                phù hợp hơn khi mà vị trí của người dùng là quan trọng cho việc cung cấp kết quả tìm
                kiếm, ví dụ: tìm quán hay cửa hàng gần người dùng nhất;
              </Gist>
              <Gist>
                Những thông tin về kết quả tìm kiếm cũng như những tin quảng cáo được truy cập cho
                phép chúng tôi cải tiến chất lượng của kết quả tìm kiếm và cung cấp cho người dùng
                những tin quảng cáo phù hợp hơn.
              </Gist>
            </List>
            <Paragraph>
              Bên cạnh đó, khi làm việc với các website của MKTLogin, một số tệp cookies có thể được
              tạo ra bởi đối tác của chúng tôi trong lĩnh vực phân phối quảng cáo – Công ty GroupM.
              Những thông tin thu thập từ các tệp cookies như vậy giúp cho GroupM điều chỉnh và cung
              cấp cho người dùng những quảng cáo phù hợp nhất. GroupM không bao giờ yêu cầu và
              MKTLogin cũng không bao giờ cung cấp cho GroupM những thông tin cá nhân hay những
              thông tin bảo mật khác của người dùng. Để biết chi tiết về cách sử dụng thông tin của
              GroupM cũng như cách từ chối cung cấp những thông tin như vậy, xin vui lòng tìm hiểu
              tại website: www.targad.info.
            </Paragraph>
            <Paragraph>
              Ngoài ra, trong một số trường hợp chúng tôi có thể cung cấp thông tin cá nhân cho các
              doanh nghiệp liên kết, các tổ chức cá nhân đáng tin cậy khác để xử lý thông tin đó cho
              chúng tôi dựa trên sự hướng dẫn của chúng tôi và tuân thủ Chính sách bảo mật của chúng
              tôi và bất kỳ biện pháp bảo mật và an toàn thích hợp nào khác. Ví dụ: chúng tôi sử
              dụng các nhà cung cấp dịch vụ để giúp chúng tôi hỗ trợ khách hàng và người dùng tốt
              hơn.
            </Paragraph>
            <Paragraph>
              Nếu bạn bật chức năng dự đoán hành vi trên mạng và truy cập vào một trang web, trình
              duyệt MKTLogin có thể liên kết tới các địa chỉ IP của tất cả các kết nối trên trang
              web đó và thiết lập các liên kết mạng nhằm đẩy nhanh quá trình truy cập. Trên một số
              website còn áp dụng công nghệ xử lý trước, cho phép tải trước các liên kết mà bạn có
              thể sẽ truy cập vào.
            </Paragraph>
            <Paragraph>
              Nếu bạn làm việc với trình duyệt MKTLogin ở chế độ ẩn danh, các tệp tin cookie được
              lưu giữ sẽ không được gửi tới các trang web mà bạn truy cập. Các trang web này có thể
              lưu giữ trong hệ thống những tệp cookie mới, nhưng chỉ trong thời gian làm việc ở chế
              độ ẩn danh. Ngay khi bạn tắt trình duyệt và tất cả các cửa sổ được mở ở chế độ ẩn
              danh, các tệp cookie này sẽ được xóa.
            </Paragraph>
            <Paragraph>
              Khi bạn bật chức năng theo dõi vị trí ở trình duyệt MKTLogin, trình duyệt có thể
              chuyển đến trang web bạn truy cập những thông tin về vị trí truy cập của bạn. MKTLogin
              sẽ chỉ làm điều đó với sự đồng ý của bạn. Công ty MKTLogin không can thiệp hay tác
              động tới những quy định cũng như biện pháp bảo mật của những trang web khác.
            </Paragraph>

            <Paragraph component="li">
              Thông tin định danh đặc biệt đối với hệ thống quản lý bản quyền số
            </Paragraph>
            <Paragraph>
              Đối với việc truy cập hướng đến một nội dung xác định trên trình duyệt MKTLogin, một
              số trang web mà sử dụng Adobe Flash Access, cũng như các đối tác về đăng tải nội dung,
              có thể yêu cầu gửi định danh đặc biệt, được lưu trữ trên máy tính của Bạn. Bạn có thể
              tắt chức năng này trong phần điều chỉnh hoặc thiết lập lại tính năng định danh đặc
              biệt khi cài đặt lại hệ điều hành. Các bên được cung cấp số ID của bạn có thể liên kết
              nó với những thông tin định danh của bạn. Điều khoản sử dụng ID để truy cập vào nội
              dung thông qua các máy chủ Google được giới thiệu trong Chính sách bảo mật của Google.
              Khi tải dữ liệu từ các trang web khác sẽ áp dụng những quy định tương ứng về bảo mật
              của trang web đó
            </Paragraph>

            <Paragraph component="li">
              Thông tin nhận được khi sử dụng các ứng dụng, mở rộng, chủ đề, dịch vụ và các tiện ích
              khác trên trình duyệt <AppName sx={{ fontWeight: 600 }} />.
            </Paragraph>
            <Paragraph>
              Trên trình duyệt MKTLogin (cũng giống như ở Chrome) có thể sử dụng các ứng dụng, mở
              rộng, chủ đề, dịch vụ và những tiện ích bổ sung khác (sau đây gọi là Tiện ích bổ sung)
              có trước hoặc được tích hợp, cũng như có sẵn trong cửa hàng internet của Google và từ
              các nguồn khác.
            </Paragraph>
            <Paragraph>
              Trước khi thiết lập các Tiện ích bổ sung, các bạn hãy đọc phần cho phép được đưa ra.
              Một vài Tiện ích bổ sung cho phép lưu trữ, xem qua, công bố thông tin với thiết bị của
              bạn hoặc tài khoản của Google Disk và sử dụng cảnh báo được gửi qua máy chủ Google.
              Trình duyệt MKTLogin có thể kiểm tra các bản cập nhật, tải về và cài đặt chúng, cũng
              như gửi đến máy chủ MKTLogin những thông tin về việc sử dụng những Tiện ích bổ sung
              này. Một vài Tiện ích bổ sung có thể đòi hỏi truy cập vào IP để quản lý quyền kỹ thuật
              số. Để từ chối truy cập vào IP, Bạn hãy xóa tiện ích này khỏi MKTLogin. Đôi khi chúng
              tôi phát hiện những Tiện ích bổ sung mà có thể đe dọa sự an toàn sử dụng và vi phạm
              những thỏa thuận, luật pháp, và các quy định. Trình duyệt MKTLogin có thể định kỳ cập
              nhật danh sách những Tiện ích bổ sung này từ máy chủ và ngắt hoặc xóa chúng từ thiết
              bị của người dùng. Các nhà cung ứng độc lập hoàn toàn chịu trách nhiệm về những thay
              đổi và bổ sung cho các Tiện ích bổ sung và có quyền áp dụng những chính sách bảo mật
              riêng của họ.
            </Paragraph>

            <Paragraph component="li">
              Thông tin được lưu trữ trên máy tính của người dùng trình duyệt{' '}
              <AppName sx={{ fontWeight: 600 }} />
            </Paragraph>
            <Paragraph>
              Cũng như các trình duyệt khác (bao gồm Google Chrome, Mozilla Firefox và Apple
              Safari), MKTLogin lưu trữ trong hệ thống của Bạn những thông tin sau:
            </Paragraph>
            <List>
              <Gist>
                Lịch sử truy cập: URL của những trang đã truy cập, file trong bộ nhớ cache bao gồm
                văn bản và hình ảnh, danh sách một số địa chỉ IP có đường dẫn tới trang web đã được
                truy cập;
              </Gist>
              <Gist>
                Danh mục hỗ trợ chức năng tìm kiếm của phần lớn những websites Bạn đã ghé thăm
                (không bao gồm những trang được bảo vệ với địa chỉ website là “https”, ví dụ như các
                websites của ngân hàng);
              </Gist>
              <Gist>Hình ảnh thu nhỏ của phần lớn các trang Bạn đã ghé thăm;</Gist>
              <Gist>
                Tệp cookie hoặc dữ liệu của những trang web đã ghé thăm có trong máy tính của Bạn;
              </Gist>
              <Gist>Dữ liệu cơ sở được lưu trữ trong phần bổ sung;</Gist>
              <Gist>Nhật ký tải xuống.</Gist>
            </List>
            <Paragraph>
              Bạn có thể xóa hoàn toàn hoặc từng phần dữ liệu các trang ghé thăm bất kì lúc nào tại
              đây:{' '}
              <Typography component="span" color="error">
                MKT://settings/clearBrowserData
              </Typography>
              . Khi bạn thực hiện thao tác này, các dữ liệu sẽ bị xóa khỏi hệ thống của bạn cũng như
              khỏi hệ thống máy chủ của MKTLogin.
            </Paragraph>
            <Paragraph>
              Ngoài ra, bạn có thể hạn chế lưu trữ thông tin bằng cách chọn chức năng ẩn danh của
              trình duyệt. Với chế độ này, trình duyệt MKTLogin không lưu lại những thông tin cơ bản
              về lịch sử làm việc trên Internet, ví dụ: URL, văn bản trong bộ nhớ cache, địa chỉ IP
              liên quan đến các trang web mà Bạn đã ghé thăm. Bên cạnh đó không lưu lại những hình
              ảnh của các trang đã ghé thăm và không thiết lập nhật kí tải xuống (mặc dù những thông
              tin này có thể được lưu trữ ở một nơi khác trên máy tính, ví dụ như trong danh sách
              những file mới mở gần đây). Những tệp cookie mới nhận được trong quá trình sử dụng chế
              độ ẩn danh, sau khi đóng trình duyệt hoặc tất cả những cửa sổ đang mở, sẽ bị xóa. Việc
              xác định rằng bạn đang ở trong chế độ ẩn danh có thể bằng dấu hiệu “ẩn danh” ở góc
              phải của trình duyệt. Đôi khi màu sắc của khung cửa sổ cũng được thay đổi.
            </Paragraph>
            <Paragraph>
              Khi bạn thực hiện bất cứ thay đổi nào trong phần thiết lập website, ví dụ như khi bạn
              mở 1 tab mới để truy cập vào trang web hoặc khi bạn thay đổi thiết lập, những thông
              tin này cũng được lưu lại. Việc sử dụng chế độ ẩn danh (chế độ khách) không làm ảnh
              hưởng đến những thay đổi như vậy.
            </Paragraph>
            <Paragraph>
              Bên cạnh đó, trong trình duyệt MKTLogin có chức năng lưu mật khẩu đối với các trang
              web cụ thể. Những mật khẩu được lưu trữ có thể được xem tại trang cài đặt của trình
              duyệt
            </Paragraph>

            <Paragraph component="li">Lời kết</Paragraph>
            <Paragraph>
              Những thông tin được chuyển tới máy chủ MKTLogin khi sử dụng trình duyệt của chúng tôi
              là cần thiết cho hoạt động hoàn thiện sản phẩm và dịch vụ. Các thông tin được chuyển
              cho nhà điều hành của các trang web khác được điều chỉnh bởi chính sách bảo mật của
              trang web đó. Trình duyệt MKTLogin lưu trữ những thông tin trong hệ thống của Bạn,
              điều này sẽ giúp cải thiện hiệu suất trình duyệt của chúng tôi và cung cấp cho bạn
              những tính năng, dịch vụ bổ sung. Xin lưu ý rằng, MKTLogin giữ quyền sửa đổi và/hoặc
              bổ sung bất kỳ điều khoản nào của Chính sách Bảo mật này vào bất kỳ thời điểm nào mà
              không cần phải thông báo trước. Những sự thay đổi và/hoặc sửa đổi như vậy sẽ có hiệu
              lực ngay khi đăng lên website này của chúng tôi.
            </Paragraph>
            <Paragraph>
              Nếu có bất kỳ vấn đề nào phát sinh từ chính sách bảo mật này, xin vui lòng liên hệ qua
              trang web này hoặc qua E-mail của chúng tôi:
            </Paragraph>
          </ul>
        </ul>
        <Title>6.2. Dịch vụ MKTLogin Points:</Title>
        <List>
          <Gist>Điều khoản tham gia.</Gist>
        </List>

        <Title>6.3. Dịch vụ MKTLogin Referral:</Title>
        <List>
          <Gist>Điều khoản dịch vụ.</Gist>
        </List>

        <Title>6.4. Quảng cáo MKTLogin:</Title>
        <List>
          <Gist>Điều khoản sử dụng.</Gist>
          <Gist>Chính sách bảo mật.</Gist>
        </List>

        <Title>6.5. Dịch vụ Rủng Rỉnh:</Title>
        <List>
          <Gist>Điều khoản sử dụng dịch vụ.</Gist>
        </List>
        <Paragraph>
          Chúng tôi thường ra mắt các dịch vụ mới và đôi khi cập nhật các điều khoản và chính sách
          của mình. Chúng tôi cố gắng hết sức để giữ cho trang này được cập nhật và cố gắng làm mới
          nó thường xuyên
        </Paragraph>

        <Title id="title_07">7. Giới hạn trách nhiệm</Title>
        <Paragraph>
          Bạn xác nhận và đồng ý rằng MKTLogin chỉ sẵn sàng cung cấp các Dịch vụ nếu Bạn đồng ý giới
          hạn trách nhiệm của chúng tôi đối với Bạn và các bên thứ ba. Bạn đồng ý rằng Bạn chịu
          trách nhiệm bồi thường duy nhất và toàn bộ đối với bất kỳ khiếu nại, tố cáo nào tới
          MKTLogin liên quan đến bất kỳ sự vi phạm quy định sử dụng nào do việc Bạn ngừng sử dụng
          Dịch vụ của MKTLogin.
        </Paragraph>
        <Paragraph>
          Bạn đồng ý bảo vệ, bồi thường và giữ cho MKTLogin và các công ty liên kết của MKTLogin và
          mỗi nhân viên, giám đốc, người lao động, đại lý, đại diện, người cung cấp thông tin và bên
          cấp phép của MKTLogin và các công ty liên kết của MKTLogin không bị tổn hại bởi bất kỳ
          khiếu nại, khiếu kiện, chi phí, tổn thất, thiệt hại, phán quyết của tòa án và phí tổn nào,
          bao gồm nhưng không giới hạn phí luật sư, liên quan đến hoặc phát sinh từ việc vi phạm
          Điều khoản Sử dụng hoặc bất kỳ sự sử dụng của Bạn đối với các Dịch vụ, hoặc bất kỳ người
          nào khác sử dụng Dịch vụ thông qua Bạn hoặc sử dụng máy tính của Bạn. MKTLogin giữ quyền,
          bằng chi phí của mình, đảm nhận hoàn toàn việc bảo vệ và kiểm soát (nhưng không có trách
          nhiệm) đối với bất kỳ vấn đề nào phát sinh như vậy tùy thuộc vào sự bồi thường của Bạn.
        </Paragraph>

        <Title id="title_08">8. Bảo mật thông tin người dùng</Title>
        <Paragraph>
          Để hiểu rõ cơ chế bảo mật thông tin người dùng, xin vui lòng đọc Chính sách bảo mật của
          MKTLogin tại{' '}
          <Typography component="span" color="error" fontWeight={700}>
            website:………
          </Typography>
          . Chính sách này sẽ cung cấp cho các bạn cơ chế thu tập, xử lý và bảo vệ thông tin người
          dùng.
        </Paragraph>

        <Title id="title_09">9. Bảo vệ bản quyền và quyền sở hữu trí tuệ khác</Title>
        <Paragraph>
          9.1. Dịch vụ của MKTLogin và tất cả các phần mềm cần thiết, yếu tố cấu thành của Dịch vụ,
          bao gồm cả các quyền sở hữu trí tuệ đối với Dịch vụ của MKTLogin , và tất cả các phần mềm
          cần thiết, yếu tố cấu thành của Dịch vụ (&#8243;Sở hữu Trí tuệ&#8243;), được bảo vệ bởi
          bản quyền, quyền về thương hiệu, nhãn dịch vụ, hoặc quyền tài sản khác do MKTLogin sở hữu
          hoặc được sở hữu bởi bên thứ ba nào mà đã cấp quyền sở hữu trí tuệ cho MKTLogin . Bạn
          không được quyền sử dụng bất kỳ tên thương mại, nhãn hiệu của hàng hóa và dịch vụ, biểu
          tượng, tên miền và các hình thức nhận diện hàng hóa, dịch vụ đặc trưng nào khác của
          MKTLogin vào mục đích thương mại trừ khi Bạn được sự chấp thuận bằng văn bản của MKTLogin
          , hoặc việc sử dụng của Bạn không gây ảnh hưởng, cản trở, tác động xấu tới việc hoạt động
          bình thường của MKTLogin.
        </Paragraph>
        <Paragraph>
          9.2. Sự biên tập (có nghĩa là thu thập, sắp xếp, và tập hợp) của tất cả Sở hữu Trí tuệ của
          Dịch vụ là tài sản độc quyền của MKTLogin và được bảo vệ bởi pháp luật Việt Nam và các
          công ước quốc tế về bản quyền. Sở hữu trí tuệ của Dịch vụ và các dịch vụ khác mà MKTLogin
          sở hữu, vận hành, kiểm soát, hoặc được cấp phép không được sao chụp, sản xuất lại, tái
          bản, tải lên, đăng lên, truyền tải, hoặc phân phối dưới bất kỳ hình thức nào. Việc sử dụng
          hoặc sửa đổi quyền sở hữu trí tuệ của MKTLogin dưới bất kỳ hình thức nào, bao gồm nhưng
          không giới hạn tới bất kỳ website hoặc môi trường được kết nối máy vi tính nào, mà không
          được sự chấp thuận trước bằng văn bản là vi phạm bản quyền và các quyền tài sản khác của
          MKTLogin và bị nghiêm cấm.
        </Paragraph>
        <Paragraph>
          9.3. Theo Điều khoản này, MKTLogin tôn trọng và không tước đoạt quyền sở hữu hoặc các
          quyền khác của bạn đối với các Nội dung bạn gửi, đăng, chuyển giao hoặc hiển thị trên
          trình duyệt của chúng tôi. Bạn đồng ý chịu trách nhiệm bảo vệ và thi hành các quyền đó, và
          MKTLogin không có nghĩa vụ thực hiện công việc đó nhân danh bạn trừ khi giữa bạn và
          MKTLogin có thỏa thuận riêng bằng văn bản về vấn đề này.
        </Paragraph>
        <Paragraph>
          9.4. Chúng tôi tôn trọng quyền sở hữu trí tuệ của người khác và yêu cầu Người sử dụng của
          MKTLogin cũng như vậy. Bạn không được tải lên, gắn vào, đăng lên, truyền đi hoặc bằng cách
          khác tạo sẵn bất kỳ yếu tố cấu thành nào gây ảnh hưởng đến bản quyền, thương hiệu, bí mật
          thương mại hoặc quyền tài sản khác của bất kỳ tổ chức hoặc cá nhân nào. Chúng tôi có quyền
          chấm dứt đường truy cập vào Dịch vụ của MKTLogin hoặc bất kỳ dịch vụ nào do MKTLogin cung
          cấp đối với người bị nghi ngờ xâm phạm.
        </Paragraph>

        <Title id="title_10">10. Điều khoản khác</Title>
        <Title>10.1. Luật điều chỉnh</Title>
        <Paragraph>
          Điều khoản Sử dụng này được điều chỉnh bởi và giải thích phù hợp với pháp luật Việt Nam.
          Nếu bất kỳ điều khoản nào trong Điều khoản Sử dụng này không hợp pháp, vô hiệu hoặc vì bất
          kỳ lý do nào không thể thực hiện được, thì điều khoản đó sẽ được xem là tách rời khỏi Điều
          khoản Sử dụng này và không ảnh hưởng đến hiệu lực và tính thực thi của các điều khoản còn
          lại của Điều khoản Sử dụng này.
        </Paragraph>
        <Title>10.2. Chấm dứt</Title>
        <Paragraph>
          Điều khoản Sử dụng này có hiệu lực cho đến khi bị chấm dứt bởi Bạn hoặc bởi MKTLogin theo
          các trường hợp sau đây:
        </Paragraph>
        <ol type="I">
          <Paragraph component="li">
            Chấm dứt bởi Bạn: Bạn có thể chấm dứt Điều khoản Sử dụng này bằng cách không sử dụng
            Dịch vụ của MKTLogin nữa.
          </Paragraph>
          <Paragraph component="li">
            Chấm dứt bởi MKTLogin : Điều khoản Sử dụng này chấm dứt ngay lập tức mà MKTLogin không
            cần phải thông báo trước nếu (i) theo sự quyết định của MKTLogin , Bạn không tuân thủ
            bất kỳ điều khoản nào của Điều khoản Sử dụng này hoặc (ii) Pháp luật hoặc quyết định của
            chính phủ, tòa án, cơ quan thi hành án yêu cầu MKTLogin chấm dứt Điều khoản Sử dụng.
          </Paragraph>
        </ol>
        <Paragraph>
          Khi chấm dứt Điều khoản Sử dụng này, Bạn phải hủy bỏ tất cả thông tin, tư liệu nhận được
          từ MKTLogin và các websites của MKTLogin, cũng như tất cả bản sao của thông tin, tư liệu
          đó, dù được lập bởi theo các quy định của Điều khoản Sử dụng này hoặc của các quy định
          khác.
        </Paragraph>
        <Title>10.3. Liên hệ</Title>
        <Paragraph>
          Nếu Bạn có bất kỳ câu hỏi nào về Điều khoản Sử dụng này, hoặc sự kết nối của Bạn với
          MKTLogin, vui lòng liên hệ với chúng tôi qua{' '}
          <Typography component="span" color="error" fontWeight={700}>
            email:………
          </Typography>
          . Tất cả các vấn đề hoặc mâu thuẫn sẽ được giải quyết nhanh chóng và hợp lý.
        </Paragraph>
      </Stack>
    </Container>
  );
};

export default ServiceView;

//----------------------------------------------------------------

function AppName({ sx }) {
  return (
    <Typography component="span" color="primary" fontStyle="italic" sx={sx}>
      MKTLogin
    </Typography>
  );
}

AppName.propTypes = {
  sx: PropTypes.object,
};

//----------------------------------------------------------------

function Title({ id, children }) {
  return (
    <Typography id={id} variant="h6">
      {children}
    </Typography>
  );
}

Title.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
};

//----------------------------------------------------------------

function Paragraph({ component, children, gutterBottom = false }) {
  return (
    <Typography component={component} paragraph gutterBottom={gutterBottom} align="justify">
      {children}
    </Typography>
  );
}

Paragraph.propTypes = {
  children: PropTypes.node,
  gutterBottom: PropTypes.bool,
  component: PropTypes.string,
};

//----------------------------------------------------------------

function Gist({ children }) {
  return (
    <ListItem alignItems="flex-start">
      <ListItemIcon sx={{ marginTop: 0 }}>
        <Iconify icon="mdi:dot" />
      </ListItemIcon>
      <ListItemText
        primary={children}
        primaryTypographyProps={{
          typography: 'body1',
        }}
      />
    </ListItem>
  );
}

Gist.propTypes = {
  children: PropTypes.node,
};

//----------------------------------------------------------------

function Attention({ children }) {
  return (
    <Typography variant="subtitle1" fontStyle="italic">
      {children}
    </Typography>
  );
}

Attention.propTypes = {
  children: PropTypes.node,
};

//----------------------------------------------------------------

function OrderItem({ title, lastTimeline }) {
  const { id, label } = title;
  const lgUp = useResponsive('up', 'lg');

  return (
    <TimelineItem
      sx={{
        minHeight: '50px',
      }}
    >
      <TimelineSeparator>
        <Link
          activeClass="active"
          to={id}
          spy
          smooth
          offset={-70}
          duration={500}
          style={{
            cursor: 'pointer',
          }}
        >
          <Tooltip title={!lgUp && label} placement="left">
            <TimelineDot color="primary" variant="outlined" />
          </Tooltip>
        </Link>
        {lastTimeline ? null : <TimelineConnector />}
      </TimelineSeparator>
      {lgUp && (
        <TimelineContent>
          <Link
            activeClass="active"
            to={id}
            spy
            smooth
            offset={-70}
            duration={500}
            style={{
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {label}
          </Link>
        </TimelineContent>
      )}
    </TimelineItem>
  );
}

OrderItem.propTypes = {
  title: PropTypes.object,
  lastTimeline: PropTypes.bool,
};
