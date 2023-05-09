import React, { useEffect, useState } from 'react';
import { Modal, Timeline, Card, Typography } from 'antd';
import { connect, Loading } from 'umi';
import type { IAirportsState } from '../model';
import dayjs from 'dayjs';

interface IProps {
    loading: boolean;
    airports: IAirportsState;
    visible: boolean;
    onClose: Function;
  }

const AirportsLog = (props: IProps) => {
    const { visible, airports, onClose, loading } = props;
    const [ items, setItems] = useState<Record<string, any>[]>([]);

    useEffect(() => {
      const items = airports.airportsLogs.map((obj: any, index: number)=>{
        return {
          time: `${dayjs(obj.action_time).format("MM/DD/YYYY - HH:mm:ss")}`,
          user: `${obj.user ? obj.user : "Anonymous user"}`,
          action: `${obj.action}`,
          airport: `the airport ${obj.airport.iata}`,
          reason: `${obj.action == "ACTIVATE" ? "." : ` due to: ${obj.details}.`}`,
          key: index
        }
      })
      setItems(items)
    }, [airports.airportsLogs]);

    return (
        <>
            <Modal 
              open={visible} 
              onCancel={()=> onClose()}
              cancelText="Close"
              okButtonProps={{ style: {display: 'none'} }}
            >
              <Card title={<Typography.Title level={2}>Airport's timeline</Typography.Title>} style={{ marginTop: "8%" }}>
                {items.length > 0 ? 
                  <Timeline reverse={true}>
                    {items.map(item => (
                      <Timeline.Item key={item?.key}>
                        {item.time} - {item.user} {item.action == "ACTIVATE" ? <span style={{ color: 'green' }}>{item.action}</span> : <span style={{ color: 'red' }}>{item.action}</span>} {item.airport}{item.reason}
                      </Timeline.Item>
                    ))}
                  </Timeline> 
                : <Typography.Title level={5}>Nothing to show for now!</Typography.Title>}
              </Card>
            </Modal>
        </>
    )
}

interface IConnect {
    airports: IAirportsState;
    loading: Loading;
  }
  
  export default connect(({ airports, loading }: IConnect) => ({
    airports,
    loading: loading.models.airports,
  }))(AirportsLog);