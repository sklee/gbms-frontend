import React from 'react';

import Adm_code from './Admin/Adm_code';
import Adm_department from './Admin/Adm_department';
import Adm_group from './Admin/Adm_group';
import Adm_menu from './Admin/Adm_menu';
import Adm_user from './Admin/Adm_user';
import Author from './Author';
import ProductList from './Product';
import ProductCode from './Product/codeProcess';
import Presentation from './Product/presentation';
import Contracts from './Contract';
import ContractsCheck from './Contract';
import FinanceAccount from './Finance/account';
import FinanceBilling from './Finance/billing';
import FinanceEvidence from './Finance/evidence';
import FinanceCode from './Finance/code';
import Billing from './BillingApprovals/Billing';
import Approvals from './BillingApprovals/Approvals';
import ReviewMgmt from './ProduceMgmt/review';
import OrderPaperMgmt from './ProduceMgmt/orderPaper';
import OrderPackaging from './ProduceMgmt/orderPackaging';
import Accident from './ProduceMgmt/accident';
import Settlement from './ProduceMgmt/settlement';
import PriceMgmt from './ProduceMgmt/price';
import ProcessMgmt from './ProduceMgmt/process';
import ProducerMgmt from './ProduceMgmt/producer';
import ProduceSimStandard from './ProduceMgmt/standard';
import ProduceMgmtCode from './ProduceMgmt/code';
import SalesAccount from './SalesMgmt/account';
import SalesSettings from './SalesMgmt/settings';
import SalesPrdGroup from './SalesMgmt/prdGroup';
import SalesRelease from './shipping/sale';
import SalesReleasePrt from './shippingPrt/salePrt';
import PresentationRelease from './shipping/presentation';
import EtcRelease from './shipping/etc';
import RequestRelease from './shipping/request';
import Home from './Home';
import BizMember from './BizMember';
import Member from './Member';
import BoardConfig from './Board/BoardConfig';
import PostConfig from './Board/Post/PostConfig';
import Post from './Board/Post';
import PostDetail from './Board/Post/PostDetail';
import PaperBook from './Product/book';
import Adm_authority from './Admin/Adm_authority';
import FinanceBillingAccounts from './Finance/billing/Accounts';
import FinanceCodeBank from './Finance/code/bankCode';
import PaperBookTab from './ProduceMgmt/orderPaper/paperbookTab';

import ProductionSim from './Production/productionSim';
import ProductionStatus from './Production/status';
import ProductReprintReview from './Production/reprintReview';

import IncomingPrd from './Incoming/Production';
import IncomingReturn from './Incoming/return';
import IncomingForwarding from './Incoming/forwarding';
import IncomingEtc from './Incoming/etc';

import BookstoreScm from './OrderRegistration/scm';
import DeliveryBook from './OrderRegistration/deliveryBook';
import OrderPresentation from './OrderRegistration/presentation';
import OtherSales from './OrderRegistration/otherSales';

import StockStatus from './Stock/stockStatus';
import ChangeHistory from './Stock/changeHistory';
import ReturnMovement from './Stock/returnMovement';
import StockMovement from './Stock/stockMovement';
import StatusChange from './Stock/statusChange';
import Coordination from './Stock/coordination';
import Disposal from './Stock/disposal';

import RoyaltyDomSTL from './Royalty/domSTL';
import RoyaltyDomSTLConf from './Royalty/domSTLConf';

// id               : int                 : 고유값
// link             : String              : location link
// label            : String              : 타이틀
// component        : </>                 : 해당 페이지를 구성하는 component
// key              : String              : 고유값 부제
// allowPermission  : array               : 해당 페이지의 접근 권한
// leftMenu         : array[boolean, int] : [왼쪽 메뉴에 포함되는지, 왼쪽 메뉴 index]
// dept             : int                 : 메뉴 종속 여부. 0 >
// parentId         : int                 : 부모 메뉴 id. id와 연결됨.
export const siteMap = [{
  id              : 0,
  link            : '/',
  label           : '대시보드',
  key             : 'dashboard', 
  component       : <Home/>,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 0,
}, {
  id              : 2,
  label           : '관리',
  key             : 'admin', 
  allowPermission : [],
  leftMenu        : [true, 12],
  dept            : 0,
}, {
  id              : 6,
  link            : '/Admin/Adm_user',
  label           : '사용자',
  key             : 'Adm_user', 
  component       : <Adm_user/>,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 2,
}, {
  id              : 3,
  link            : '/Admin/Adm_code',
  label           : '공통 코드',
  key             : 'Adm_code', 
  component       : <Adm_code/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 2,
}, {
  id              : 4,
  link            : '/Admin/Adm_department',
  label           : '부서와 코드 연결',
  key             : 'Adm_department', 
  component       : <Adm_department/>,
  allowPermission : [],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 2,
}, {
  id              : 5,
  link            : '/Admin/Adm_group',
  label           : '부서 그룹',
  key             : 'Adm_group', 
  component       : <Adm_group/>,
  allowPermission : [],
  leftMenu        : [true, 3],
  dept            : 1,
  parentId        : 2,
}, {
  id              : 6,
  link            : '/Admin/Adm_menu',
  label           : '메뉴',
  key             : 'Adm_menu', 
  component       : <Adm_menu/>,
  allowPermission : [],
  leftMenu        : [true, 4],
  dept            : 1,
  parentId        : 2,
}, {
  id              : 7,
  label           : '상품',
  key             : 'ProductAll', 
  allowPermission : [false],
  leftMenu        : [true, 1],
  dept            : 0,
}, {
  id              : 8,
  link            : '/Product',
  label           : '현황',
  key             : 'productList', 
  component       : <ProductList/>,
  allowPermission : [false],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 7,
}, {
  id              : 9,
  link            : '/Product/codeProcess',
  label           : '상품 코드 신청 처리',
  key             : 'productCode', 
  component       : <ProductCode/>,
  allowPermission : [false],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 7,
}, {
  id              : 60,
  link            : '/Product/presentation',
  label           : '증정',
  key             : 'presentation', 
  component       : <Presentation/>,
  allowPermission : [false],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 7,
}, {
  id              : 10,
  label           : '저작권',
  key             : 'author', 
  allowPermission : [false],
  leftMenu        : [true, 2],
  dept            : 0,
}, {
  id              : 11,
  link            : '/Author/copyrights',
  label           : '국내, 해외 직계약 저작권자',
  key             : 'copyrights', 
  component       : <Author/>,
  allowPermission : [false],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 12,
  link            : '/Author/owners',
  label           : '해외 수입 권리자',
  key             : 'owners', 
  component       : <Author/>,
  allowPermission : [false],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 13,
  link            : '/Author/contributors',
  label           : '기여자',
  key             : 'contributors', 
  component       : <Author/>,
  allowPermission : [false],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 14,
  link            : '/Author/brokers',
  label           : '중개자',
  key             : 'brokers', 
  component       : <Author/>,
  allowPermission : [false],
  leftMenu        : [true, 3],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 15,
  link            : '/Contract',
  label           : '저작권 계약',
  key             : 'contracts', 
  component       : <Contracts/>,
  allowPermission : [false],
  leftMenu        : [true, 4],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 16,
  link            : '/Contract/inspect',
  label           : '저작권 계약 검수',
  key             : 'contracts-check', 
  component       : <ContractsCheck/>,
  allowPermission : [false],
  leftMenu        : [true, 5],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 90,
  link            : '/royalty/domSTL',
  label           : '국내 - 정산',
  key             : 'royaltyDomSTL', 
  component       : <RoyaltyDomSTL/>,
  allowPermission : [],
  leftMenu        : [true, 6],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 92,
  link            : '/royalty/domSTLConf',
  label           : '국내 - 정산 검토',
  key             : 'royaltyDomSTLConf', 
  component       : <RoyaltyDomSTLConf/>,
  allowPermission : [false],
  leftMenu        : [true, 7],
  dept            : 1,
  parentId        : 10,
}, {
  id              : 17,
  label           : '비용 청구',
  key             : 'BillingApprovals', 
  allowPermission : [false],
  leftMenu        : [true, 3],
  dept            : 0,
}, {
  id              : 18,
  link            : '/BillingApprovals/Billing',
  label           : '청구',
  key             : 'Billing', 
  component       : <Billing/>,
  allowPermission : [false],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 17,
}, {
  id              : 19,
  link            : '/BillingApprovals/Approvals',
  label           : '결재',
  key             : 'Approvals', 
  component       : <Approvals/>,
  allowPermission : [false],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 17,
}, {
  id              : 20,
  label           : '재무 관리',
  key             : 'Finance', 
  allowPermission : [false],
  leftMenu        : [true, 4],
  dept            : 0,
}, {
  id              : 21,
  link            : '/Finance/billing/billing1',
  label           : '비용 지급 - 청구(국내)',
  key             : 'billing1', 
  component       : <FinanceBilling/>,
  allowPermission : [false],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 20,
}, {
  id              : 22,
  link            : '/Finance/billing/billing2',
  label           : '비용 지급 - 청구(해외)',
  key             : 'billing2', 
  component       : <FinanceBilling/>,
  allowPermission : [false],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 20,
}, {
  id              : 23,
  link            : '/Finance/billing/billingAccounts',
  label           : '비용 지급 - 정기',
  key             : 'billingAccounts', 
  component       : <FinanceBillingAccounts/>,
  allowPermission : [false],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 20,
}, {
  id              : 24,
  link            : '/Finance/account',
  label           : '거래처(매입) 관리',
  key             : 'financeAccount', 
  component       : <FinanceAccount/>,
  allowPermission : [false],
  leftMenu        : [true, 3],
  dept            : 1,
  parentId        : 20,
}, {
  id              : 25,
  link            : '/Finance/evidence',
  label           : '결재선 지정 관리',
  key             : 'financeEvidence', 
  component       : <FinanceEvidence/>,
  allowPermission : [false],
  leftMenu        : [true, 4],
  dept            : 1,
  parentId        : 20,
}, {
  id              : 55,
  link            : '/Finance/code',
  label           : '코드 관리',
  key             : 'financeCode', 
  component       : <FinanceCode/>,
  allowPermission : [false],
  leftMenu        : [true, 5],
  dept            : 1,
  parentId        : 20,
}, {
  id              : 26,
  label           : '제작 관리',
  key             : 'produceMgmt', 
  allowPermission : [],
  leftMenu        : [true, 6],
  dept            : 0,
}, {
  id              : 28,
  link            : '/ProduceMgmt/review',
  label           : '제작 검토',
  key             : 'reviewMgmt', 
  component       : <ReviewMgmt/>,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 26,
}, {
  id              : 29,
  link            : '/ProduceMgmt/orderPaper',
  label           : '제작 발주(종이책)',
  key             : 'orderMgmt', 
  component       : <OrderPaperMgmt/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 26,
}, {
  id              : 30,
  link            : '/ProduceMgmt/orderPackaging',
  label           : '제작 발주(포장물품)',
  key             : 'orderPackaging', 
  component       : <OrderPackaging/>,
  allowPermission : [],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 26,
}, {
  id              : 85,
  link            : '/ProduceMgmt/accident',
  label           : '사고 관리',
  key             : 'accident', 
  component       : <Accident/>,
  allowPermission : [],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 26,
}, {
  id              : 86,
  link            : '/ProduceMgmt/settlement',
  label           : '정산 관리',
  key             : 'settlement', 
  component       : <Settlement/>,
  allowPermission : [],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 26,
}, {
  id              : 31,
  label           : '제작 관리 설정',
  key             : 'prdBasicSetting', 
  allowPermission : [],
  leftMenu        : [true, 3],
  dept            : 1,
  parentId        : 26,
}, {
  id              : 32,
  link            : '/ProduceMgmt/price',
  label           : '종이/가격 관리',
  key             : 'priceMgmt', 
  component       : <PriceMgmt/>,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 2,
  parentId        : 31,
}, {
  id              : 33,
  link            : '/ProduceMgmt/process',
  label           : '공정/가격 관리',
  key             : 'processMgmt', 
  component       : <ProcessMgmt/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 2,
  parentId        : 31,
}, {
  id              : 34,
  link            : '/ProduceMgmt/producer',
  label           : '제작처 관리',
  key             : 'producerMgmt', 
  component       : <ProducerMgmt/>,
  allowPermission : [],
  leftMenu        : [true, 2],
  dept            : 2,
  parentId        : 31,
}, {
  id              : 35,
  link            : '/ProduceMgmt/standard',
  label           : '제작 시뮬레이션 기준',
  key             : 'produceSimStandard', 
  component       : <ProduceSimStandard/>,
  allowPermission : [],
  leftMenu        : [true, 3],
  dept            : 2,
  parentId        : 31,
}, {
  id              : 36,
  link            : '/ProduceMgmt/code',
  label           : '코드 관리',
  key             : 'produceMgmtCode', 
  component       : <ProduceMgmtCode/>,
  allowPermission : [],
  leftMenu        : [true, 4],
  dept            : 2,
  parentId        : 31,
}, {
  id              : 37,
  label           : '영업 관리',
  key             : 'salesMgmt', 
  allowPermission : [],
  leftMenu        : [true, 11],
  dept            : 0,
}, {
  id              : 38,
  link            : '/salesMgmt/account',
  label           : '거래처(매출)',
  key             : 'account', 
  component       : <SalesAccount/>,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 37,
}, {
  id              : 39,
  link            : '/salesMgmt/settings',
  label           : '담당자 설정',
  key             : 'settings', 
  component       : <SalesSettings/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 37,
}, {
  id              : 71,
  link            : '/salesMgmt/prdGroup',
  label           : '상품 그룹',
  key             : 'prdGroup', 
  component       : <SalesPrdGroup/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 37,
}, {
  id              : 40,
  link            : '/shipping',
  label           : '출고',
  key             : 'shipping', 
  allowPermission : [],
  leftMenu        : [true, 9],
  dept            : 0,
}, {
  id              : 72,
  link            : '/shipping/sale',
  label           : '판매 출고',
  key             : 'sale', 
  component       : <SalesRelease/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 40,
}, {
  id              : 73,
  link            : '/shipping/presentation',
  label           : '증정 출고',
  key             : 'presentation', 
  component       : <PresentationRelease/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 40,
}, {
  id              : 74,
  link            : '/shipping/etc',
  label           : '기타 출고',
  key             : 'etc', 
  component       : <EtcRelease/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 40,
}, {
  id              : 75,
  link            : '/shipping/request',
  label           : '출고 요청',
  key             : 'request', 
  component       : <RequestRelease/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 40,
}, {
  id              : 41,
  link            : '/bizMember',
  label           : '',
  key             : 'BizMember', 
  component       : <BizMember/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 42,
  link            : '/member',
  label           : '',
  key             : 'Member', 
  component       : <Member/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 43,
  link            : '/boardConfig',
  label           : '',
  key             : 'BoardConfig', 
  component       : <BoardConfig/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 44,
  link            : '/postConfig',
  label           : '',
  key             : 'PostConfig', 
  component       : <PostConfig/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 45,
  link            : '/board/:id',
  label           : '',
  key             : 'Post', 
  component       : <Post/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 46,
  link            : '/post/:id',
  label           : '',
  key             : 'PostDetail', 
  component       : <PostDetail/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 47,
  link            : '/product/book/',
  label           : '',
  key             : 'PaperBook', 
  component       : <PaperBook/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 48,
  link            : '/admin/adm_authority',
  label           : '',
  key             : 'Adm_authority', 
  component       : <Adm_authority/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 49,
  link            : '/Finance/billing/Accounts/:type',
  label           : '',
  key             : 'FinanceBillingAccounts', 
  component       : <FinanceBillingAccounts/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 50,
  link            : '/Finance/code/bankCode',
  label           : '',
  key             : 'FinanceCodeBank', 
  component       : <FinanceCodeBank/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 51,
  link            : '/ProduceMgmt/paperBookTab',
  label           : '',
  key             : 'paperBookTab', 
  component       : <PaperBookTab/>,
  allowPermission : [],
  leftMenu        : [false, 0],
}, {
  id              : 54,
  link            : '/Production',
  label           : '제작',
  key             : 'Production', 
  allowPermission : [],
  leftMenu        : [true, 5],
  dept            : 0,
}, {
  id              : 55,
  link            : '/Production/productionSim',
  label           : '제작 시뮬레이션',
  key             : 'productionSim', 
  component       : <ProductionSim/>,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 54,
}, {
  id              : 56,
  link            : '/Production/status',
  label           : '제작 현황',
  key             : 'productionStatus', 
  component       : <ProductionStatus/>,
  allowPermission : [],
  leftMenu        : [true, 1],
  dept            : 1,
  parentId        : 54,
}, {
  id              : 57,
  link            : '/Production/reprintReview',
  label           : '재쇄 검토',
  key             : 'productionReprintReview', 
  component       : <ProductReprintReview/>,
  allowPermission : [],
  leftMenu        : [true, 2],
  dept            : 1,
  parentId        : 54,
}, {
  id              : 58,
  link            : '/incoming',
  label           : '입고',
  key             : 'incoming', 
  allowPermission : [],
  leftMenu        : [true, 7],
  dept            : 0,
}, {
  id              : 59,
  link            : '/incoming/production',
  label           : '제작',
  key             : 'incomingPrd', 
  component       : <IncomingPrd/>,
  allowPermission : [],
  leftMenu        : [false, 0],
  dept            : 1,
  parentId        : 58,
}, {
  id              : 76,
  link            : '/incoming/return',
  label           : '반품 처리',
  key             : 'incomingReturn',
  component       : <IncomingReturn/>,
  allowPermission : [],
  leftMenu        : [false, 0],
  dept            : 1,
  parentId        : 58,
}, {
  id              : 77,
  link            : '/incoming/forwarding',
  label           : '회송 입고',
  key             : 'incomingForwarding',
  component       : <IncomingForwarding/>,
  allowPermission : [],
  leftMenu        : [false, 0],
  dept            : 1,
  parentId        : 58,
}, {
  id              : 78,
  link            : '/incoming/etc',
  label           : '기타 입고',
  key             : 'incomingEtc',
  component       : <IncomingEtc/>,
  allowPermission : [],
  leftMenu        : [false, 0],
  dept            : 1,
  parentId        : 58,
}, {
  id              : 61,
  link            : '/orderRegistration',
  label           : '주문 등록',
  key             : 'orderRegistration', 
  allowPermission : [],
  leftMenu        : [true, 8],
  dept            : 0,
}, {
  id              : 62,
  link            : '/orderRegistration/scm',
  label           : '서점 SCM',
  key             : 'scm', 
  component       : <BookstoreScm />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 61,
}, {
  id              : 63,
  link            : '/orderRegistration/deliveryBook',
  label           : '신간 배본',
  key             : 'deliveryBook', 
  component       : <DeliveryBook />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 61,
}, {
  id              : 64,
  link            : '/orderRegistration/presentation',
  label           : '증정',
  key             : 'orderpresentation', 
  component       : <OrderPresentation />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 61,
}, {
  id              : 89,
  link            : '/orderRegistration/otherSales',
  label           : '기타 매출 등록',
  key             : 'otherSales', 
  component       : <OtherSales />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 61,
}, {
  id              : 79,
  link            : '/stock',
  label           : '재고',
  key             : 'stock', 
  allowPermission : [],
  leftMenu        : [true, 10],
  dept            : 0,
}, {
  id              : 87,
  link            : '/stock/stockStatus',
  label           : '재고 현황',
  key             : 'stockStatus', 
  component       : <StockStatus />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {
  id              : 88,
  link            : '/stock/changeHistory',
  label           : '재고 변동 내역',
  key             : 'changeHistory', 
  component       : <ChangeHistory />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {
  id              : 80,
  link            : '/stock/returnMovement',
  label           : '반품 이동',
  key             : 'returnMovement', 
  component       : <ReturnMovement />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {
  id              : 81,
  link            : '/stock/stockMovement',
  label           : '재고 이동',
  key             : 'stockMovement',
  component       : <StockMovement />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {
  id              : 82,
  link            : '/stock/statusChange',
  label           : '상태 변경',
  key             : 'statusChange',
  component       : <StatusChange />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {
  id              : 83,
  link            : '/stock/coordination',
  label           : '재고 조정',
  key             : 'coordination',
  component       : <Coordination />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {
  id              : 84,
  link            : '/stock/disposal',
  label           : '폐기 관리',
  key             : 'disposal',
  component       : <Disposal />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 79,
}, {id              : 93,
  link            : '/shippingPrt',
  label           : '출고 PRT',
  key             : 'shippingPrt', 
  allowPermission : [],
  leftMenu        : [true, 10],
  dept            : 0,
}, {
  id              : 94,
  link            : '/shippingPrt/salePrt',
  label           : '판매 출고 PRT',
  key             : 'salePrt', 
  component       : <SalesReleasePrt />,
  allowPermission : [],
  leftMenu        : [true, 0],
  dept            : 1,
  parentId        : 93,
} ];

// siteMap을 menuData로 쓸 수 있도록 형태 변환하는 함수
export const getMenuData = (isPrivate = false) => {
  // siteMap 한번 더 부르기
  let allowSiteMap = siteMap
  // siteMap에서 parentId를 가진 unit Object
  let childrenList = {}
  // childrenList에서 parentId를 key로 나눈 Object
  let menuObject = {}
  // childrenList가 가지고 있던 parentId key 배열
  let parentIdArr = []
  // parentIdArr를 key로 뽑아낸, 자식 요소를 가진 siteMap Object
  let parentList = {}
  // 자식 요소를 가지고 있지 않은 dept가 0인 siteMap Object
  let mergeToParentList = {}
  // 위 2개 Object 합친 최종 결과 값
  let resultMenuData = {}

  if (isPrivate) {
    allowSiteMap = allowSiteMap.filter((siteMapData) => (siteMapData.allowPermission[0] !== false))
  }
  
  
  // parentId를 가진 unit을 분리하여 childrenList 변수에 몰아넣는다. 
  childrenList = allowSiteMap.filter(item => item.parentId !== undefined);
  // 같은 parentId를 가진 unit끼리 menuObject에 몰아넣는다.
  childrenList.map((item) => {
    if (menuObject[item.parentId] === undefined) {
      menuObject[item.parentId] = []
      parentIdArr.push(item.parentId)
    }
    menuObject[item.parentId].push(item)

    return menuObject
  })

  // parentList와 mergeToParentList 추출
  parentList = allowSiteMap.filter(item => parentIdArr.includes(item.id))
  mergeToParentList = allowSiteMap.filter(item => (item.leftMenu[0] && item.parentId === undefined && !parentIdArr.includes(item.id)));

  // 자식 요소 Object를 부모 요소에 children key로 주입
  parentList.map((parentElement) => {
    parentElement.children = menuObject[parentElement.id]
  })
  // 2개 Object Merge
  mergeToParentList.map((e) => {
    parentList.push(e)
  })
  // 자식 요소를 가졌지만 최상위 단이 아닌 값 제거
  resultMenuData = parentList.filter(item => item.dept === 0)

  // 지정한 index에 따라 순서 조정
  resultMenuData.sort((a, b) => {
    return a.leftMenu[1] - b.leftMenu[1]
  })

  return resultMenuData
}

export default siteMap