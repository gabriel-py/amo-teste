import React, { useEffect, useState } from 'react';
import { Table, Switch, Modal, message, Button, Tooltip, Row, Col, Select, Card, Typography, Statistic, Space, Descriptions, Input } from 'antd';
import { connect, Dispatch, Loading } from 'umi';
import type { IAirportsState } from './model';
import { QuestionCircleOutlined, SearchOutlined, SnippetsOutlined } from '@ant-design/icons';
import './index.less';
import Highlighter from 'react-highlight-words';
import AirportsLog from './components/logs';

interface IProps {
  loading: boolean;
  airports: IAirportsState;
  dispatch: Dispatch;
}

const { TextArea } = Input;

const AirportsPage = (props: IProps) => {
  const { dispatch } = props;
  const [airports, changeAirports] = useState<Record<string, any>[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(undefined);
  const [textAreaMessage, setMessage] = useState('');
  const [searchText, changeSearchText] = useState<string>('');
  const [searchedColumn, changeSearchedColumn] = useState<string>('');
  const [visibleLogs, setVisibleLogs] = useState(false);
  let searchInput = useState<any>();

  useEffect(() => {
    dispatch({ type: 'airports/init' });
  }, []);

  useEffect(() => {
    changeAirports(props.airports.airports);
  }, [props.airports.airports]);

  const changeAirportState = (action: string, deactivate_text: string | undefined) => {
    if(!selectedRecord){
      return
    }
    dispatch({
      type: 'airports/changeAirportStatus',
      payload: {
        iata: selectedRecord?.iata,
        action: action,
        reason_text: deactivate_text,
      }
    }).then(() => {
      message.success({
        type: 'success',
        content: ` Airport ${selectedRecord?.iata} is now ${deactivate_text ? "deactivated": "activated"}.`,
        duration: 5,
      });
      dispatch({ type: 'airports/init' });
      setModalIsOpen(false)
      setSelectedRecord(undefined)
      setMessage('')
    })
  }

  const handleSearchText = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    changeSearchText(selectedKeys[0]);
    changeSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    changeSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string, campo: string, isDate: boolean = false) => ({
    filterDropdown: (params: any) => {
      const { setSelectedKeys, selectedKeys, confirm, clearFilters } = params;
      return (
        <div style={{ padding: '8px' }}>
          <Input
            ref={(node) => {
              searchInput = node;
            }}
            placeholder={`Pesquisar ${campo}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearchText(selectedKeys, confirm, dataIndex)}
            style={{ width: '200px', marginBottom: '8px', display: 'block' }}
          />
          <Space>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              style={{ width: '80px' }}
            >
              Limpar
            </Button>
            <Button
              type="primary"
              onClick={() => handleSearchText(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: '110px' }}
            >
              Pesquisar
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) => {
      const new_record = isDate ? dayjs(record[dataIndex]).format('DD/MM/YYYY') : record[dataIndex];
      return new_record ? new_record.toString().toLowerCase().includes(value.toLowerCase()) : '';
    },
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: '1px', borderRadius: '2px' }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const onCloseLogs = () => {
    setVisibleLogs(false)
  }

  const columns = [
    {
      title: 'IATA',
      dataIndex: 'iata',
      align: 'center',
      ...getColumnSearchProps('iata', 'iata'),
      sorter: (a: any, b: any) => (a.iata > b.iata ? 1 : -1),
    },
    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      filters: [...new Set(airports?.map((air: any) => air.state))].map((item: any) => {
        return {
          text: item,
          value: item,
        };
      }),
      onFilter: (value: any, record: any) => record.state === value,
    },
    {
      title: 'City',
      dataIndex: 'city',
      align: 'center',
      ...getColumnSearchProps('city', 'city'),
      sorter: (a: any, b: any) => (a.city > b.city ? 1 : -1),
    },
    {
      title: 'Latitude',
      dataIndex: 'lat',
      align: 'center',
    },
    {
      title: 'Longitude',
      dataIndex: 'lon',
      align: 'center',
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      align: 'center',
      render: (value: boolean, record: any) => {
        return (
          <Switch 
            checked={value}
            onClick={()=>{
              setSelectedRecord(record)
            }}
            onChange={() => {
              setSelectedRecord(record)
              if(record.is_active){
                setModalIsOpen(true)
              } else {
                setConfirmIsOpen(true)
              }
            }}
            checkedChildren="yes"
            unCheckedChildren="no"
          />
        )
      },
      filters: [...new Set(airports?.map((air: any) => air.is_active))].map((item: any) => {
        return {
          text: item ? "Active" : "Not Active",
          value: item,
        };
      }),
      onFilter: (value: any, record: any) => record.is_active === value,
    },
    {
      title: 'Logs',
      dataIndex: '',
      align: 'center',
      render: (value: string, record: any) => {
        return (
          <Button
            onClick={()=>{
              dispatch({ type: 'airports/fetchAirportLogs', payload: {iata: record?.iata }}).then(()=>{
                setVisibleLogs(true)
              });
            }}
            shape='circle'
            icon={<SnippetsOutlined />}
          />
        )
      }
    }
  ];

  return (
    <Card
      title={
        <Row>
          <Space>
            <Col>
              <Typography.Title level={5}>
                Airports
                <Tooltip
                  mouseEnterDelay={0.5}
                  placement="topLeft"
                  title="Panel to see and manage the airports distribution across Brazil"
                >
                  <QuestionCircleOutlined style={{ fontSize: '13px', paddingLeft: '10px' }} />
                </Tooltip>
              </Typography.Title>
            </Col>
            <Col>
              <Card bordered={false}>
                <Statistic
                  title="Active"
                  value={airports?.filter((obj: any)=>obj.is_active==true).length}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col>
              <Card bordered={false}>
                <Statistic
                  title="Not active"
                  value={airports?.filter((obj: any)=>obj.is_active==false).length}
                  precision={0}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Space>
        </Row>
      }
      extra={
        <>
          <img src="https://avatars.githubusercontent.com/u/47430793?s=200&v=4" height="50px"></img>
        </>
      }
    >
      <Table
        rowKey={"key"}
        loading={props.loading}
        columns={columns} 
        dataSource={airports} 
        pagination={{ 
          pageSizeOptions: ['5', '10', '30', '100'],
          defaultPageSize: 10,
        }}
        scroll={{ y: 'max-content' }} 
      />
      <Modal 
        open={modalIsOpen}
        onCancel={() => setModalIsOpen(false)}
        okText="Confirm"
        onOk={()=>{
          changeAirportState("DEACTIVATE", textAreaMessage)
        }}
      >
        <Row>
          <Col style={{ marginRight: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
              <Descriptions title="" layout="vertical">
                <Descriptions.Item label="Please, tell us why you are turning this airport off">
                  <TextArea value={textAreaMessage} rows={4} onChange={(e)=>{
                    setMessage(e.target.value)
                  }} />
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
        </Row>
      </Modal>
      <Modal
        title="Please, confirm"
        open={confirmIsOpen}
        onOk={()=>{ 
          changeAirportState("ACTIVATE", undefined)
          setConfirmIsOpen(false)
        }}
        onCancel={()=>{setConfirmIsOpen(false)}}
        okText="Activate"
        cancelText="Cancel"
      >
        <Typography.Title level={4}>Do you want to activate the airport <span style={{ color: '#fa4475' }}>{selectedRecord?.iata}</span>?</Typography.Title>
      </Modal>
      <AirportsLog visible={visibleLogs} onClose={onCloseLogs} />
    </Card>
  )
};

interface IConnect {
  airports: IAirportsState;
  loading: Loading;
}

export default connect(({ airports, loading }: IConnect) => ({
  airports,
  loading: loading.models.airports,
}))(AirportsPage);