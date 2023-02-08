library(tidyverse)
library(foreign)
library(sf)
library(jsonlite)
library(mapview)
library(imputeTS)


lehd_raw <- read_csv("data/data2018/ut_od_main_JT00_2018.csv") %>%
  select(w_geocode, h_geocode, S000) # S000 is Number of Jobs
township_codes <- read_csv("data/data2019/citytownship.csv") %>%
  select(1,2) %>%
  mutate(SHORTDESC = case_when(
    CODE3 == "EMT" ~ "Emigration Canyon",
    CODE3 == "CMT" ~ "Copperton",
    CODE3 == "KMT" ~ "Kearns",
    CODE3 == "MMT" ~ "Magna",
    CODE3 == "WHT" ~ "White City",
    TRUE ~ SHORTDESC
  ))
uofu_adj <- read_csv("data/data2018/490351108004_Manual_Allocation.csv") %>%
  mutate(GEOID = as.factor(GEOID))

wfrc_towns <- c("AFK","ALA","ALP","BDL","BGM","BNT","BRT","CDF","CEN","CHA","CHL","CLF","CLI","CMT","COA","CWH","DAN","DRA","EAG","ELK","EMT","FAR","FCS","FFD","FRR","FTH","GLA","GOS","GRL","HAR","HDT","HDT","HEB","HER","HGH","HNF","HOL","HOO","HVL","IND","INT","KAY","KMS","KMT","LAY","LEH","LIN","MAP","MID","MLC","MMT","MRG","MSL","MUR","MWY","NOG","NSL","OGD","OKL","ORM","PAY","PGR","PLN","PRK","PRY","PVO","PVW","ROY","RVD","RVT","SAN","SAQ","SAR","SFK","SJC","SLC","SLM","SOG","SPV","SSL","SUN","SWE","SYR","TAY","TOO","UIN","VIN","WAT","WBG","WDL","WEB","WHT","WHV","WIL","WJC","WPT","WVC","WXC")




# block level coordinates
blockcity <- read.dbf("data/data2019/blockcentersWBlockGroup.dbf") %>%
  select(GEOID, GEOID10,x,y) %>% st_as_sf(coords = c("x","y"), crs = 4326) %>%
  st_transform(crs = 4326) %>%   
  st_as_sf() %>%
  st_transform(26912) 

# township shapefile
sf_townships <- st_read("data/data2019/Municipalities_Township/Municipalities_Township.shp") %>%
  st_transform(crs = 4326) %>%   
  st_as_sf() %>%
  st_transform(26912) 

mapview(blockcity) + 
  mapview(sf_townships, color = "grey40")

# get the township that corresponds to each block point
blockpoint_city <- st_join(blockcity, sf_townships, join = st_within)
blockpoint_city_full <- blockpoint_city %>%
  select(GEOID, GEOID10, COUNTYNBR, NAME, SHORTDESC) %>%
  left_join(township_codes, by = c("SHORTDESC" = "SHORTDESC")) %>%
  select(GEOID10, CODE3, SHORTDESC) %>%
  mutate(GEOID10 = as.numeric(as.character(GEOID10))) %>%
  mutate(CODE3 = ifelse(is.na(CODE3), "XXX", CODE3),
         SHORTDESC = ifelse(is.na(SHORTDESC), "Outside Area", SHORTDESC))
blockcity_wfrc <- blockpoint_city_full %>% 
  mutate(CODE3 = ifelse(CODE3 %in% wfrc_towns, CODE3, "XXX"),
         SHORTDESC = ifelse(CODE3 %in% wfrc_towns, SHORTDESC, "Outside WFRC Area"))





homeside <- left_join(lehd_raw,blockpoint_city_full, by = c("h_geocode" = "GEOID10")) %>%
  mutate(h_geocode = as.character(h_geocode), w_geocode = as.character(w_geocode))
workside <- left_join(lehd_raw,blockpoint_city_full, by = c("w_geocode" = "GEOID10")) %>%
  mutate(h_geocode = as.character(h_geocode), w_geocode = as.character(w_geocode))
homeside_wfrc <- homeside %>%
  mutate(CODE3 = ifelse(CODE3 %in% wfrc_towns, CODE3, "XXX"),
         SHORTDESC = ifelse(CODE3 %in% wfrc_towns, SHORTDESC, "Outside WFRC Area"))
workside_wfrc <- workside %>%
  mutate(CODE3 = ifelse(CODE3 %in% wfrc_towns, CODE3, "XXX"),
         SHORTDESC = ifelse(CODE3 %in% wfrc_towns, SHORTDESC, "Outside WFRC Area"))


blockseq <-  homeside_wfrc %>% 
  left_join(blockcity, by = c("w_geocode" = "GEOID10")) %>%
  expand(GEOID, CODE3 = (c(wfrc_towns,"XXX")))


homeside_wide <- homeside_wfrc %>%
  left_join(blockcity, by = c("w_geocode" = "GEOID10")) %>%
  select(-SHORTDESC, -h_geocode) %>%
  group_by(GEOID, CODE3) %>%
  summarize(SumS000 = sum(S000)) %>% ungroup() 
homeside_wide_full <- blockseq %>%
  left_join(homeside_wide)%>%
  complete(GEOID,CODE3) %>%
  arrange(CODE3) %>%
  pivot_wider(names_from = CODE3, values_from = SumS000, values_fn = sum, names_glue = "{CODE3}_h") %>%
  na_replace(0)
homeside_wide_ttl <- homeside_wide_full %>% as.tibble() %>%
  mutate(TTL_h = rowSums(.[2:99])) %>%
  select(-XXX_h)

workside_wide <- workside_wfrc %>%
  left_join(blockcity, by = c("h_geocode" = "GEOID10")) %>%
  select(-SHORTDESC, -w_geocode) %>%
  group_by(GEOID, CODE3) %>%
  summarize(SumS000 = sum(S000)) %>% ungroup()
workside_wide_full <- blockseq %>%
  left_join(workside_wide)%>%
  complete(GEOID,CODE3) %>%
  arrange(CODE3) %>%
  pivot_wider(names_from = CODE3, values_from = SumS000, values_fn = sum, names_glue = "{CODE3}_w") %>%
  na_replace(0)
workside_wide_ttl <- workside_wide_full %>% as.tibble() %>%
  mutate(TTL_w = rowSums(.[2:99])) %>% 
  select(-XXX_w)

home_work_ttl <- left_join(homeside_wide_ttl, workside_wide_ttl)

results_at_blockgroups <- home_work_ttl %>%
  mutate(fakeid = row_number() - 1) %>%
  select(198,1:197) %>%
  #adjust for UofU bad allocation
  subset(GEOID !=  "490351108004") %>%
  bind_rows(uofu_adj) %>%
  arrange(fakeid) %>%
bind_rows(summarise(.,
                    across(where(is.numeric), sum),
                    across(where(is.factor), ~"colSUM"))) %>%
  slice(n(),1:(n()-1)) %>%
  mutate(fakeid = ifelse(GEOID == "colSUM", 0,fakeid))
write_csv(results_at_blockgroups, "data/data2018/lehd_at_blockgroup_level2018.csv")


















