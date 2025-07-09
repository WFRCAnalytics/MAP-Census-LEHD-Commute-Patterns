
# Import libraries -------------------------------------------------------------
library(tidyverse)
library(sf)
library(mapview)
library(jsonlite)


# Read in global vars ----------------------------------------------------------
config <- fromJSON("config.json")
year <- config$year
bg_year <- config$bg_year


# Read Inputs -------------------------------------------------------------------
#block groups
bg <- st_read(paste0("data/data",year,"/tl_",bg_year,"_49_bg/tl_",bg_year,"_49_bg.shp")) %>%
  st_transform(26912) 
bgc <- bg %>% st_centroid()

#geoid geography
geo <- bg %>% select(GEOID)

#small districts
sd <- st_read(paste0("data/data",year,"/Dist_Small/Dist_Small.shp")) 
sdc <- sd %>% st_centroid()

#counties
counties_shp <- st_read(paste0("data/data",year,"/Utah_County_Boundaries-shp/Counties.shp"))


#Add State and County Fips to Small District Geography--------------------------
#counties
counties <- counties_shp %>%
  mutate(STATEFP20 = '49', 
         COUNTYFP20 = ifelse(nchar(FIPS) == 1, paste0("00",FIPS),paste0("0",FIPS))) %>%
  select(STATEFP20,COUNTYFP20) %>%
  st_transform(26912) 

#join county/state data to small districts
sdco <- st_join(sdc, counties, join = st_within) %>%
  as_tibble() %>%
  select(-geometry) %>%
  left_join(sd) %>%
  st_as_sf()


## Join Small District Data to Block Groups-------------------------------------
bgsd <- st_join(bgc, sd, join = st_within) %>%
  select(STATEFP, COUNTYFP, TRACTCE, DISTSML, DSML_NAME, BLKGRPCE, GEOID, 
         NAMELSAD, MTFCC, FUNCSTAT, ALAND, AWATER, INTPTLAT, INTPTLON, geometry
        ) %>%
  select(-5) %>%
  as_tibble() %>%
  select(-geometry) %>%
  left_join(geo) %>%
  st_as_sf()



## Write Outputs ---------------------------------------------------------------
st_write(sdco, paste0("data/data",year,"/Dist_Small/Dist_Small_Counties.shp"),delete_dsn = TRUE)
st_write(bgsd, paste0("data/data",year,"/tl_",bg_year,"_49_bg/tl_",bg_year,"_49_sd_bg.shp"),delete_dsn = TRUE)
