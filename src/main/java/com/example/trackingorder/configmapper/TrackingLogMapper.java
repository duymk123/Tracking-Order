package com.example.trackingorder.configmapper;

import com.example.trackingorder.dto.response.TrackingHistoryRes;
import com.example.trackingorder.entity.TrackingLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TrackingLogMapper {
    @Mapping(source = "updateBy.username", target = "updatedBy")
    @Mapping(source = "timestamp", target = "updateAt")
    TrackingHistoryRes toTrackingHistoryRes(TrackingLog trackingLog);

    List<TrackingHistoryRes> toTrackingHistoryResList(List<TrackingLog> trackingLogs);
}
